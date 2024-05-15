# BetterIDEa CodeCell

Now you can integrate our code cells into your webapps and run AO LUA anywhere 🎉

## Installation

```bash
npm install @betteridea/codecell
```

## Usage

```javascript
import { CodeCell, runCell } from '@betteridea/codecell';

// in your react app
<CodeCell
  cellId="1" // any unique cell id
  appName="BetterIDEa" // Your unique app name
  code="print('Portable code cell ftw!')" // initial code (optional)
/>
```

To run code from external sources, you can use the `runCell` function.

```javascript
import { runCell } from '@betteridea/codecell';

...

// This will run whatever code is typed in the cell with the id provided
runCell("<id of the cell>");
```

## API

### `CodeCell`

#### Props

- `cellId` - Unique id for the cell
- `appName` - Unique app name
- `code` - Initial code for the cell
- `width` - Width of the cell
- `height` - Height of the cell
- `className` - Class names for styling
- `style` - Inline styles
- `devMode` - Boolean to enable dev mode

### `runCell`

#### Arguments

- `cellId` - Unique id of the cell to run
- `devMode` - Boolean to enable dev mode

## Developing

To start the vite development server, run:

```bash
cd packages/codecell
npm install
npm run dev
```

then make changes to the component and run function and test them in the vite app at [http://localhost:5173](http://localhost:5173)

CodeCell component -> [./src/components/CodeCell.tsx]()

runCell function -> [./src/lib/runCell.ts]()

Both are essentially a wrapper around https://ide.betteridea.dev/codecell page from the main [IDE](https://ide.betteridea.dev) to run the code in any webapp through an iframe.

/codecell -> [next_app/src/pages/codecell.tsx]()