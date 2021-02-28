#!/bin/sh

set -e

# Build binaries (see `pkg` in `package.json` for details)
npx pkg --out-path bin .

# Zip binaries with renaming appropriate to the platform
cd bin
tar --transform='flags=r;s|jesta-linux|jesta|' -czvf x86_64-unknown-linux-gnu.tar.gz jesta-linux
tar --transform='flags=r;s|jesta-macos|jesta|' -czvf x86_64-apple-darwin.tar.gz jesta-macos
mv jesta-win.exe jesta.exe && zip x86_64-pc-windows-msvc.zip jesta.exe
