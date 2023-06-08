#!/bin/bash

# Check if a port number is passed as an argument
if [[ -z "$1" ]]; then
    echo "Error: PORT is not set. Usage: ./kill-node-port.sh 3000"
    exit 1
fi

PORT=$1
echo "NodeJS process PORT: $PORT, PIDs:"

# Get the PIDs of the processes listening on the specified port
NodePIDs=$(netstat -tulpn 2>/dev/null | grep ":$PORT" | grep "node" | awk '{print $7}' | sed 's/\/node//')

# Check if any NodePIDs were detected
if [[ -z "$NodePIDs" ]]; then
    echo "No Node.js processes detected on port $PORT."
    exit 0
fi

echo $NodePIDs

for PID in $NodePIDs; do
    # Find the parent process ID (PPID)
    NODE_PPID=$(ps -o ppid= -p $PID)

    # Kill the child process
    echo "Killing NodeJS child process PORT: $PORT with PID: $PID"
    sudo kill $PID

    # Kill the parent process
    if [[ -n "$NODE_PPID" ]]; then
        echo "Killing NodeJS parent process with PPID: $NODE_PPID"
        sudo kill $NODE_PPID
    fi
done
