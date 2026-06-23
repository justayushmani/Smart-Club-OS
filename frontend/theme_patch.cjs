const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const filesToPatch = [
  'Sidebar.jsx',
  'NoticeBoard.jsx',
  'KanbanTracker.jsx',
  'AdminATS.jsx',
  'FormBuilder.jsx',
  'JoinUs.jsx'
];

const replacements = [
  [/bg-white/g, 'bg-zinc-900'],
  [/bg-gray-50/g, 'bg-zinc-950'],
  [/bg-gray-100/g, 'bg-zinc-800'],
  [/bg-gray-200/g, 'bg-zinc-700'],
  [/border-gray-100/g, 'border-zinc-800'],
  [/border-gray-200/g, 'border-zinc-800'],
  [/border-gray-300/g, 'border-zinc-700'],
  [/text-gray-400/g, 'text-zinc-500'],
  [/text-gray-500/g, 'text-zinc-400'],
  [/text-gray-600/g, 'text-zinc-400'],
  [/text-gray-700/g, 'text-zinc-300'],
  [/text-gray-800/g, 'text-zinc-100'],
  [/text-gray-900/g, 'text-zinc-50'],
  [/blue-600/g, 'orange-600'],
  [/blue-700/g, 'orange-700'],
  [/blue-500/g, 'orange-500'],
  [/blue-400/g, 'orange-400'],
  [/blue-100/g, 'orange-900\/30'],
  [/blue-50/g, 'orange-900\/20'],
  [/text-blue-800/g, 'text-orange-400'],
  [/emerald-600/g, 'orange-600'],
  [/emerald-500/g, 'orange-500'],
  [/emerald-400/g, 'orange-400'],
  [/emerald-100/g, 'orange-900\/30'],
  [/emerald-700/g, 'orange-400'],
  [/emerald-50/g, 'orange-900\/20'],
  [/text-emerald-800/g, 'text-orange-400'],
  [/text-emerald-900/g, 'text-orange-200'],
  [/teal-400/g, 'yellow-500'],
  [/teal-500/g, 'orange-500'],
  [/teal-600/g, 'orange-600'],
];

filesToPatch.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
  }
});
