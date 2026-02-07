import os
import sys

try:
    import libtorrent
    print(f"Libtorrent imported successfully. Version: {libtorrent.version}")
except ImportError as e:
    print(f"Failed to import libtorrent: {e}")
    # Try to import libtorrent_windows_dll if available to patch?
    # Some packages require importing the patcher first if it exists
    try:
        import libtorrent_windows_dll
        print("libtorrent_windows_dll is installed.")
    except ImportError:
        print("libtorrent_windows_dll is NOT installed.")
    
    # Print search paths
    print(f"Path: {sys.path}")
    print(f"CWD: {os.getcwd()}")
