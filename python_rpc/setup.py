import os
import sys
from cx_Freeze import setup, Executable

# Patch: Filter out WindowsApps from PATH to prevent Access Denied errors in cx_Freeze
os.environ['PATH'] = ';'.join([p for p in os.environ.get('PATH', '').split(';') if 'WindowsApps' not in p])


# Dependencies are automatically detected, but it might need fine tuning.
build_exe_options = {
    "packages": ["libtorrent"],
    "build_exe": "hydra-python-rpc",
    "include_msvcr": True
}

setup(
    name="hydra-python-rpc",
    version="0.1",
    description="Hydra",
    options={"build_exe": build_exe_options},
    executables=[Executable(
      "python_rpc/main.py",
      target_name="hydra-python-rpc",
      icon="build/icon.ico"
    )]
)
