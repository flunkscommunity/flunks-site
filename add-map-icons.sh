#!/bin/bash

# Quick script to add icons to all the empty divs in the Semester0Map
# This will add appropriate emoji icons for each location

cd /Users/jeremy/Desktop/flunks-site

# Football field
sed -i '' 's|        }\n      >\n      </div>|        }\n      >\n        🏈\n      </div>|g' src/windows/Semester0Map.tsx

echo "Added football field icon"

# Snack shack
sed -i '' 's|            })\n          )\n        }\n      >\n      </div>|            })\n          )\n        }\n      >\n        🍟\n      </div>|g' src/windows/Semester0Map.tsx

echo "Icons added - checking file"
