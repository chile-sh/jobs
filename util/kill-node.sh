#!/bin/bash

NodePIDs=$(ps aux | grep [n]ode | grep -v ".vscode-server" | awk '{print $2}' | sort | uniq)

for PID in $NodePIDs; do
    echo "Killing NodeJS process with PID: $PID"
    kill $PID
done
