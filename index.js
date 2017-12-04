#!/usr/bin/env node

const path = require('path');
const os = require('os');
const pkg = require('./package.json')

function getInterfaces(options) {
  const ifs = os.networkInterfaces();
  return Object.keys(ifs)
    .map((name) => {
      const addresses = ifs[name].filter(addr => (
        (options.v4 && addr.family === 'IPv4') ||
          (options.v6 && addr.family === 'IPv6')
      ))
      return [name, addresses];
    })
    .filter(([name, data]) => (
      !options.interfaces.length ||
        options.interfaces.some(iface => name.match(iface))
    ))
    .filter(([name, data]) => options.all || data.some(d => !d.internal));
}

function parseArgs(argv) {
  const name = path.basename(argv[1]);
  const options = {
    all: false,
    interfaces: [],
    quiet: false,
    v4: false,
    v6: false,
  };

  argv.slice(2).forEach((arg) => {
    switch (arg) {
      case '-4':
        options.v4 = true;
        break;
      case '-6':
        options.v6 = true;
        break;
      case '-a':
      case '--all':
        options.all = true;
        break;
      case '-h':
      case '--help':
        console.log(`usage: ${name} [options] [ifaces...]

Show information about network interfaces.

Options:

  -4               Include IPv4 addresses
  -6               Include IPv6 addresses
  -a,--all         Include local/internal interfaces
  -q,--quiet       Hide interface names
  -v,--version     Show version
  -h,--help        Show help/usage
`);
        process.exit(0);
        break;
      case '-q':
      case '--quiet':
        options.quiet = true;
        break;
      case '-v':
      case '--version':
        console.log(pkg.version);
        process.exit(0);
        break;
      default:
        options.interfaces.push(arg);
    }
  });

  if (!(options.v4 ^ options.v6)) {
    options.v4 = true;
    options.v6 = true;
  }

  return options;
}

function run() {
  const options = parseArgs(process.argv);

  const ifs = getInterfaces(options)
    .forEach(([name, data]) => {
      if (!options.quiet) {
        process.stdout.write(name + ' ');
      }
      console.log(data.map(d => d.address).join(', '));
    });
}

run();
