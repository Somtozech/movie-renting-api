const Table = require('cli-table');

function logTable(head, content) {
  const table = new Table({
    head: head,
    chars: {
      top: '-',
      'top-mid': '+',
      'top-left': '+',
      'top-right': '+',
      bottom: '-',
      'bottom-mid': '+',
      'bottom-left': '+',
      'bottom-right': '+',
      left: '|',
      'left-mid': '+',
      mid: '-',
      'mid-mid': '+',
      right: '|',
      'right-mid': '+',
      middle: '|'
    }
  });
  table.push(...content);
  console.log(table.toString());
}

module.exports = logTable;
