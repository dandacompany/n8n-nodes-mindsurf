#!/bin/bash

# n8n custom nodes directory
N8N_CUSTOM_DIR="$HOME/.n8n/custom"

# Create custom directory if it doesn't exist
if [ ! -d "$N8N_CUSTOM_DIR" ]; then
    echo "Creating n8n custom directory..."
    mkdir -p "$N8N_CUSTOM_DIR"
fi

# Build the project
echo "Building the project..."
npm run build

# Option 1: Using npm link (recommended for development)
echo "Creating npm link..."
npm link

# Navigate to n8n custom directory and link the package
echo "Linking to n8n custom directory..."
cd "$N8N_CUSTOM_DIR"
npm link n8n-nodes-mindsurf

echo "✅ Installation complete!"
echo ""
echo "Please restart n8n for the changes to take effect:"
echo "  n8n start"
echo ""
echo "The Mindsurf node should now be available in your n8n instance!"