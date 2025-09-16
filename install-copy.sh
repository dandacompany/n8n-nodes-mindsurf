#!/bin/bash

# Alternative installation method: Direct copy
# Use this if npm link doesn't work

# n8n custom nodes directory
N8N_CUSTOM_DIR="$HOME/.n8n/custom/n8n-nodes-mindsurf"

# Create custom directory if it doesn't exist
if [ ! -d "$N8N_CUSTOM_DIR" ]; then
    echo "Creating n8n custom directory..."
    mkdir -p "$N8N_CUSTOM_DIR"
fi

# Build the project
echo "Building the project..."
npm run build

# Copy files to n8n custom directory
echo "Copying files to n8n custom directory..."
cp -r dist "$N8N_CUSTOM_DIR/"
cp -r nodes "$N8N_CUSTOM_DIR/"
cp package.json "$N8N_CUSTOM_DIR/"
cp -r node_modules "$N8N_CUSTOM_DIR/"

echo "✅ Installation complete!"
echo ""
echo "Please restart n8n for the changes to take effect:"
echo "  n8n start"
echo ""
echo "The Mindsurf node should now be available in your n8n instance!"