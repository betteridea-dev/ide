#!/bin/bash

SCRIPT_NAME=$(basename "$0")
OUTPUT_FILE="cookbook.md"
rm -f "$OUTPUT_FILE"

rm -rf ao-cookbook
git clone https://github.com/permaweb/ao-cookbook

cd ao-cookbook/src

echo "# Cookbook Documentation" > "$OUTPUT_FILE"

echo "Starting script at $(date)"

# Generate tree structure
echo "Generating tree structure..."
# echo "## Project Structure" >> "$OUTPUT_FILE"
# echo '```' >> "$OUTPUT_FILE"
# tree -I ".git|$OUTPUT_FILE|$SCRIPT_NAME" --gitignore >> "$OUTPUT_FILE"
# echo '```' >> "$OUTPUT_FILE"
# echo "" >> "$OUTPUT_FILE"

echo "Processing markdown files..."

# Directories to ignore
IGNORE_DIRS="node_modules|dist|build|.git|zh|ja|kr|ru"

# Use tree to list only .md files, respecting .gitignore, excluding specific directories
tree -if --noreport --gitignore -I "$IGNORE_DIRS" | grep '\.md$' | sed 's|^./||' | while read -r file; do
    # Skip the output file itself
    if [ "$file" != "$OUTPUT_FILE" ]; then
        echo "Adding $file"
        echo "## File: $file" >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        # Strip SVG tags and add content to output file
        cat "$file" | sed '/<svg/,/<\/svg>/d' >> "$OUTPUT_FILE"
        echo -e '\n```' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "File processing completed at $(date)"

mv "$OUTPUT_FILE" ../../"$OUTPUT_FILE"

echo "Codebase conversion complete. Output saved to $OUTPUT_FILE"
echo "File size:"
ls -lh "$OUTPUT_FILE"

echo "Script finished at $(date)"

cd ../..
rm -rf ao-cookbook