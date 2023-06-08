#!/bin/bash

# Usage: PORT=3000 bash kill-node-port.sh

NodePIDs=$(lsof -i tcp:"$PORT" | grep [n]ode | awk '{print $2}' | sort | uniq)

for PID in $NodePIDs; do
    echo "Killing NodeJS process PORT: $PORT with PID: $PID"
    kill $PID
done
