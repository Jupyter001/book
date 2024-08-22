
# C++笔记
> 作者：夏子峻
>
> 2023-11-17

## 在MACOS上安装VSCODE和XCODE
XCODE在Appstore上下载

VSCODE通过官网安装
## 配置VSCODE的C++调试环境
通过修改两个json文件实现C++的运行和配置环境

tasks.json:控制C++文件的编译过程，若有多个CPP文件，需要将多个cpp文件名添加到task.json中
例如：

```
 "args": [
                "-fcolor-diagnostics",
                "-fansi-escape-codes",
                "-g",
                "${file}",
                "sum.cpp",
                "mul.cpp",
                "-o",
                "${fileDirname}/${fileBasenameNoExtension}"
            ],
```
sum.cpp,mul.cpp是和main.cpp在同一目录下被包含的源文件，若不添加他们，则会发生链接错误

launch.json：控制文件的调试过程
添加：

```"preLaunchTask":"C/C++: clang++ 生成活动文件",```

目的：每次调试前都编译一次，实现修改代码后调试的代码就是修改后的

添加：

```"program": "${workspaceFolder}/${fileBasenameNoExtension}",```

```fileBasenameNoExtension``` ：不带后缀的可执行文件

如main.cpp编译后的main文件