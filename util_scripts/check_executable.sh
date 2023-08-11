#!/bin/bash

set -eu

# check all .sh files are executable
invalid_scripts=0
for script in $( find . -type f -iname *.sh ); do
    if [ ! -x $script ]; then
        echo "Script $script is not executable"
        invalid_scripts=$((invalid_scripts + 1))
    fi
done
if [ $invalid_scripts != 0 ]; then
    exit 1
fi
