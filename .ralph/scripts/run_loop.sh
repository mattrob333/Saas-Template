#!/bin/bash
# Ralph Loop Execution Script
# Usage: ./run_loop.sh <prompt-name>
# Example: ./run_loop.sh schema-loop

set -e

# Configuration
PROMPTS_DIR="$(dirname "$0")/../prompts"
STATE_DIR="$(dirname "$0")/../state"
MAX_ITERATIONS=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: No prompt specified${NC}"
    echo "Usage: ./run_loop.sh <prompt-name>"
    echo "Available prompts:"
    ls -1 "$PROMPTS_DIR"/*.md 2>/dev/null | xargs -n1 basename | sed 's/.md$//'
    exit 1
fi

PROMPT_NAME="$1"
PROMPT_FILE="$PROMPTS_DIR/$PROMPT_NAME.md"

# Check prompt exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: Prompt file not found: $PROMPT_FILE${NC}"
    exit 1
fi

# Create state directory if needed
mkdir -p "$STATE_DIR"

# State file for this loop
STATE_FILE="$STATE_DIR/$PROMPT_NAME.state"
ITERATION=0

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Starting Ralph Loop: $PROMPT_NAME${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Prompt:${NC} $PROMPT_FILE"
echo -e "${YELLOW}State:${NC} $STATE_FILE"
echo ""

# Main loop
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo -e "${YELLOW}--- Iteration $ITERATION of $MAX_ITERATIONS ---${NC}"
    
    # Run Claude Code with the prompt
    # Note: --dangerously-skip-permissions allows autonomous execution
    # Remove this flag for attended operation
    if cat "$PROMPT_FILE" | claude --dangerously-skip-permissions; then
        echo -e "${GREEN}Iteration $ITERATION completed successfully${NC}"
    else
        echo -e "${RED}Iteration $ITERATION failed${NC}"
        echo "Stopping loop. Review the error and adjust the prompt or spec."
        exit 1
    fi
    
    # Check for completion signal
    # This looks for a specific pattern in the implementation plan
    # Customize based on your completion criteria
    if grep -q "## Status: COMPLETE" "specs/implementation.mmd" 2>/dev/null; then
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}Loop completed! All tasks done.${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo "$ITERATION" > "$STATE_FILE"
        exit 0
    fi
    
    # Brief pause between iterations
    echo ""
    sleep 2
done

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Max iterations reached ($MAX_ITERATIONS)${NC}"
echo -e "${YELLOW}Loop paused. Review progress and restart if needed.${NC}"
echo -e "${YELLOW}========================================${NC}"
