@ECHO OFF
SETLOCAL
SET ProgFiles86Root=%ProgramFiles(x86)%
IF NOT "%ProgFiles86Root%"=="" GOTO win64
SET ProgFiles86Root=%ProgramFiles%
:win64
set tf_exe="%ProgFiles86Root%\Microsoft Visual Studio 12.0\Common7\IDE\tf.exe"

@ECHO ON
%tf_exe% add * /recursive