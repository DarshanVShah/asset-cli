# asset-md 60-second demo
# Run with: vhs docs/demo.tape
Output docs/demo.gif

Set FontSize 14
Set Width 1100
Set Height 700
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 35ms

# Setup happens off-camera so the demo focuses on the CLI itself.
Hide
Type "rm -rf /tmp/asset-md-demo && mkdir -p /tmp/asset-md-demo && cd /tmp/asset-md-demo"
Enter
Type "mkdir -p assets/characters assets/ui assets/audio"
Enter
Type "touch assets/characters/shopkeeper_bear.png assets/ui/coin_counter.png assets/audio/register_chime.wav"
Enter
Type "clear"
Enter
Show

Type "# A new game project with three assets and no cards."
Enter
Sleep 800ms
Type "asset-md scan"
Enter
Sleep 2500ms

Type "# Generate starter cards for everything missing one."
Enter
Sleep 800ms
Type "asset-md create-missing"
Enter
Sleep 2500ms

Type "# Validate that every card meets the spec."
Enter
Sleep 800ms
Type "asset-md validate"
Enter
Sleep 2500ms

Type "# Print an agent-ready instruction block for one asset."
Enter
Sleep 800ms
Type "asset-md prompt assets/characters/shopkeeper_bear.png"
Enter
Sleep 4000ms

Type "# Drop the asset-aware rule into CLAUDE.md."
Enter
Sleep 800ms
Type "asset-md rules --target claude"
Enter
Sleep 2500ms

Type "# Done. Your agent now knows what every asset is for."
Enter
Sleep 2500ms
