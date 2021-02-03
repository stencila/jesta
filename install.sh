#!/bin/sh

# Script for installing latest version of Jesta on Linux and MacOS

# Determine the operating system
case $(uname) in
  Darwin) OS="macos" ;;
  Linux) OS="linux" ;;
  *) echo "Unsupported operating system" && exit ;;
esac

# Get the latest release version
VERSION=$(curl -sL https://api.github.com/repos/stencila/jesta/releases/latest | grep '"tag_name":' | cut -d'"' -f4)

# Download the binary for the OS to /usr/local/bin
sudo curl -sL https://github.com/stencila/jesta/releases/download/$VERSION/jesta-$OS -o /usr/local/bin/jesta

# Make it executable
sudo chmod +x /usr/local/bin/jesta
