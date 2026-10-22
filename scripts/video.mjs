import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { access, copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const submitTool = 'connector__matrix__submit_video_generation';
const queryTool = 'connector__matrix__query_video_generation';
const imageMimeTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.heic', 'image/heic'],
  ['.heif', 'image/heif']
]);

try {
  const options = parseArguments(process.argv.slice(2));
  const cliPath = process.env.MCODE_TOOLS_CLI || path.join(homedir(), '.minimax', 'bin', 'mcode-tools-cn.cmd');

  if (options.check) {
    await checkConnection(cliPath);
  } else if (options.dryRun) {
    const request = await makeRequest(options, []);
    console.log(JSON.stringify({
      model: request.model,
      duration: request.duration,
      ratio: options.referenceImages.length ? 'adaptive' : request.ratio,
      resolution: request.resolution,
      referenceImages: options.referenceImages.length,
      promptCharacters: request.prompt.length,
      submitsGeneration: false
    }, null, 2));
  } else {
    await generate(cliPath, options);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function parseArguments(args) {
  const options = { referenceImages: [], resolution: '768P', ratio: '9:16' };
  const values = new Map([
    ['--prompt', 'prompt'],
    ['--prompt-file', 'promptFile'],
    ['--duration', 'duration'],
    ['--ratio', 'ratio'],
    ['--resolution', 'resolution'],
    ['--reference-image', 'referenceImage'],
    ['--task-id', 'taskId'],
    ['--output', 'output']
  ]);

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (key === '--check') options.check = true;
    else if (key === '--dry-run') options.dryRun = true;
    else if (values.has(key)) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
      const name = values.get(key);
      if (name === 'referenceImage') options.referenceImages.push(value);
      else if (name === 'duration') options.duration = Number(value);
      else options[name] = value;
    } else if (key === '--help' || key === '-h') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${key}`);
    }
  }

  if (options.check && (args.length !== 1 || options.dryRun)) throw new Error('--check cannot be combined with generation options');
  if (options.taskId && (options.prompt || options.promptFile || options.duration || options.referenceImages.length)) {
    throw new Error('--task-id only supports --output; do not provide a prompt, duration, or reference images');
  }
  if (options.taskId && options.dryRun) throw new Error('--dry-run cannot be combined with --task-id');
  if (options.prompt && options.promptFile) throw new Error('Use either --prompt or --prompt-file, not both');
  if (!options.check && !options.taskId && !options.prompt && !options.promptFile) throw new Error('Provide --prompt or --prompt-file');
  if (!options.check && !options.taskId && (!Number.isInteger(options.duration) || options.duration < 4 || options.duration > 15)) {
    throw new Error('MiniMax-H3 requires --duration from 4 through 15 seconds');
  }
  if (!['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'].includes(options.ratio)) {
    throw new Error('Unsupported --ratio');
  }
  if (!['768P', '2K'].includes(options.resolution)) throw new Error('--resolution must be 768P or 2K');
  if (options.referenceImages.length > 9) throw new Error('MiniMax-H3 accepts at most 9 reference images');
  if (options.output && path.extname(options.output).toLowerCase() !== '.mp4') throw new Error('--output must use the .mp4 extension');
  return options;
}

function printUsage() {
  console.log(`Usage:
  npm run video -- --check
  npm run video -- --prompt-file <path> --duration <4-15> [options]
  npm run video -- --prompt <text> --duration <4-15> [options]
  npm run video -- --task-id <id> [--output <path.mp4>]

Options:
  --ratio <ratio>              H3 aspect ratio (default: 9:16)
  --resolution <768P|2K>       Output resolution (default: 768P)
  --reference-image <path>     H3 reference image; may be repeated (max 9)
  --output <path.mp4>          Local output path (default: generated/videos/)
  --task-id <id>               Resume polling and download for an existing H3 task
  --dry-run                    Validate the request without contacting MCode
  --check                      Verify local MCode login and H3 tools without generating
  MCODE_TOOLS_CLI               Override the local MCode CLI path`);
}

async function makeRequest(options, referenceImages) {
  const prompt = options.promptFile
    ? await readFile(path.resolve(options.promptFile), 'utf8')
    : options.prompt;
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) throw new Error('The video prompt is empty');
  if (trimmedPrompt.length > 7000) throw new Error('MiniMax-H3 prompts must be 7000 characters or fewer');
  return {
    model: 'MiniMax-H3',
    prompt: trimmedPrompt,
    duration: options.duration,
    ratio: options.ratio,
    resolution: options.resolution,
    ...(referenceImages.length ? { reference_images: referenceImages } : {})
  };
}

async function checkConnection(cliPath) {
  const auth = await callMCode(cliPath, ['auth', 'status']);
  if (findString(auth, ['status']) !== 'authenticated') {
    throw new Error('MCode is not authenticated. Sign in with MiniMax Code, then run npm run video -- --check again.');
  }
  const { tools } = await callMCode(cliPath, ['connector', 'tools', '--keyword', 'video']);
  const names = new Set((tools || []).map(tool => tool.tool_name));
  if (!names.has(submitTool) || !names.has(queryTool)) {
    throw new Error('The MCode account does not expose both H3 video-generation tools.');
  }
  console.log('MCode authenticated; MiniMax H3 submit and status tools are available.');
}

async function generate(cliPath, options) {
  await checkConnection(cliPath);
  const outputPath = path.resolve(options.output || path.join('generated', 'videos', `${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`));
  try {
    await access(outputPath);
    throw new Error(`Output file already exists: ${outputPath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'book-mcode-video-'));

  try {
    let taskId = options.taskId;
    if (!taskId) {
      const request = await makeRequest(options, []);
      const referenceImages = [];
      for (const [index, imagePath] of options.referenceImages.entries()) {
        const source = path.resolve(imagePath);
        const extension = path.extname(source).toLowerCase();
        const mimeType = imageMimeTypes.get(extension);
        if (!mimeType) throw new Error(`Unsupported reference image format: ${imagePath}`);
        await access(source);
        const temporaryImage = path.join(temporaryDirectory, `reference-${index}${extension}`);
        await copyFile(source, temporaryImage);
        const upload = await callMCode(cliPath, ['upload-temp-url', '--mime-type', mimeType, temporaryImage]);
        const url = findString(upload, ['temp_url']);
        if (!url) throw new Error(`MCode did not return a temporary URL for ${imagePath}`);
        referenceImages.push({ url, mime_type: mimeType });
      }

      if (referenceImages.length) {
        request.reference_images = referenceImages;
        request.ratio = 'adaptive';
      }
      const argsFile = path.join(temporaryDirectory, 'submit.json');
      await writeFile(argsFile, JSON.stringify(request), 'utf8');
      const submitted = await callMCode(cliPath, ['connector', 'call', submitTool, '--args-file', argsFile]);
      taskId = findString(submitted, ['task_id', 'taskid']);
      if (!taskId) throw new Error(`MCode did not return a video task ID: ${JSON.stringify(submitted)}`);
      console.log(`MiniMax-H3 task submitted: ${taskId}`);
    } else {
      console.log(`Resuming MiniMax-H3 task: ${taskId}`);
    }
    console.log('Waiting for video generation; H3 may take 15–30 minutes.');

    const deadline = Date.now() + 45 * 60 * 1000;
    let videoUrl;
    while (Date.now() < deadline) {
      await delay(15_000);
      const status = await callMCode(cliPath, [
        'connector', 'call', queryTool,
        '--args-file', await writeQueryArgs(temporaryDirectory, taskId)
      ]);
      const state = findString(status, ['status'])?.toLowerCase();
      if (state === 'succeeded') {
        videoUrl = findString(status, ['video_url']);
        if (!videoUrl) throw new Error(`H3 task succeeded but returned no video URL: ${JSON.stringify(status)}`);
        break;
      }
      if (state === 'failed' || state === 'cancelled') {
        throw new Error(`H3 task ${state}: ${JSON.stringify(status)}`);
      }
      if (!['queued', 'running'].includes(state)) {
        throw new Error(`Unexpected H3 task status: ${JSON.stringify(status)}`);
      }
      console.log(`H3 status: ${state}`);
    }
    if (!videoUrl) throw new Error(`Timed out waiting for H3 task ${taskId}; rerun later to query it before the result expires.`);

    await mkdir(path.dirname(outputPath), { recursive: true });
    if (new URL(videoUrl).protocol !== 'https:') throw new Error('MiniMax returned a non-HTTPS video URL; refusing to download it.');
    const response = await fetch(videoUrl);
    if (!response.ok || !response.body) throw new Error(`Could not download generated video (HTTP ${response.status})`);
    const temporaryOutput = `${outputPath}.part-${process.pid}`;
    try {
      await pipeline(Readable.fromWeb(response.body), createWriteStream(temporaryOutput, { flags: 'wx' }));
      await rename(temporaryOutput, outputPath);
    } catch (error) {
      await rm(temporaryOutput, { force: true });
      throw error;
    }
    console.log(`Video saved locally: ${outputPath}`);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function writeQueryArgs(directory, taskId) {
  const argsFile = path.join(directory, 'query.json');
  await writeFile(argsFile, JSON.stringify({ task_id: taskId, model: 'MiniMax-H3' }), 'utf8');
  return argsFile;
}

async function callMCode(cliPath, args) {
  const result = await runCli(cliPath, args);
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`MCode CLI returned non-JSON output for "${args.slice(0, 3).join(' ')}": ${result.stdout.trim() || result.stderr.trim()}`);
  }
}

function runCli(cliPath, args) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const executable = isWindows ? (process.env.ComSpec || 'cmd.exe') : cliPath;
    const commandArgs = isWindows
      ? ['/d', '/s', '/c', `call "${cliPath}" ${args.map(value => `"${value}"`).join(' ')}`]
      : args;
    const child = spawn(executable, commandArgs, {
      windowsVerbatimArguments: isWindows,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk; });
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk; });
    child.on('error', error => reject(new Error(`Could not start MCode CLI: ${error.message}`)));
    child.on('close', code => {
      if (code !== 0) reject(new Error(`MCode CLI failed (${code}): ${stderr.trim() || stdout.trim()}`));
      else resolve({ stdout, stderr });
    });
  });
}

function findString(value, keys) {
  if (!value || typeof value !== 'object') return undefined;
  for (const [key, item] of Object.entries(value)) {
    if (keys.includes(key.toLowerCase()) && typeof item === 'string') return item;
  }
  for (const item of Object.values(value)) {
    const found = findString(item, keys);
    if (found) return found;
  }
  return undefined;
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
