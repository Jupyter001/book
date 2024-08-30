## Simulink库
Simulink 的库（Library）中包含了许多组件，用于不同类型的建模和仿真。以下是一些主要的组件库及其功能：

### 1. **Continuous (连续系统)**
   - 包含连续时间系统的组件，如积分器、传递函数、状态空间模型等。
   - 组件示例：
     - Integrator（积分器）
     - Transfer Fcn（传递函数）
     - State-Space（状态空间）

### 2. **Discrete (离散系统)**
   - 包含离散时间系统的组件，如离散传递函数、离散状态空间模型等。
   - 组件示例：
     - Discrete Transfer Fcn（离散传递函数）
     - Discrete State-Space（离散状态空间）

### 3. **Math Operations (数学运算)**
   - 包含基本的数学运算组件，如加法、乘法、矩阵运算等。
   - 组件示例：
     - Sum（求和）
     - Product（乘积）
     - Gain（增益）

### 4. **Logic and Bit Operations (逻辑和位运算)**
   - 包含逻辑运算（如与、或、非）和位运算的组件。
   - 组件示例：
     - Logical Operator（逻辑运算符）
     - Relational Operator（关系运算符）
     - Bitwise Operator（位运算符）

### 5. **Sinks (信号接收端)**
   - 包含用于显示或记录仿真结果的组件，如示波器、记录器等。
   - 组件示例：
     - Scope（示波器）
     - To Workspace（导出到工作区）
     - Display（显示）

### 6. **Sources (信号源)**
   - 包含信号生成的组件，如常数、脉冲、正弦波等。
   - 组件示例：
     - Constant（常数）
     - Sine Wave（正弦波）
     - Pulse Generator（脉冲发生器）

### 7. **Signal Routing (信号路由)**
   - 包含用于信号分发和合并的组件，如多路复用器、分解器等。
   - 组件示例：
     - Mux（多路复用器）
     - Demux（解复用器）
     - Switch（开关）

### 8. **User-Defined Functions (用户定义函数)**
   - 包含一些可以让用户编写自定义函数的组件，如 MATLAB Function、S-Function 等。
   - 组件示例：
     - MATLAB Function
     - S-Function
     - Interpreted MATLAB Function

### 9. **Lookup Tables (查找表)**
   - 用于查找表操作的组件，允许在仿真中使用预定义的表格数据。
   - 组件示例：
     - 1-D Lookup Table（1维查找表）
     - 2-D Lookup Table（2维查找表）
     - n-D Lookup Table（n维查找表）

### 10. **Ports & Subsystems (端口和子系统)**
   - 用于创建和管理子系统、模型引用和信号连接的组件。
   - 组件示例：
     - Subsystem（子系统）
     - Inport（输入端口）
     - Outport（输出端口）

这些只是 Simulink 中的一部分组件库。Simulink 还包含了许多用于特定领域的扩展库，如 **Simulink Control Design**（控制设计）、**Simulink Real-Time**（实时仿真）等，提供了更多专业的组件。