# BetterIDEa - A web based IDE for AO the computer

<center>

[![](https://img.shields.io/badge/Visit_the_IDE-lightgreen)](https://ide.betteridea.dev)
[![](https://img.shields.io/badge/Read_the_docs-lightgreen)](https://docs.betteridea.dev)
[![X Follow](https://img.shields.io/twitter/follow/betteridea_dev)](https://twitter.com/betteridea_dev)

[![protocol.land](https://arweave.net/eZp8gOeR8Yl_cyH9jJToaCrt2He1PHr0pR4o-mHbEcY)](https://protocol.land/#/repository/b4b210a3-a1ec-4b6b-8e0e-a37bdfa7a22a)

</center>


<details>
<summary>View screenshots</summary>

![1](./images/1.png)

![2](./images/2.png)

![3](./images/3.png)

![4](./images/4.png)

</details>

## Features

- Code Editor and IDE Features such as syntax highlighting, code completion, etc.
- Web UI to run AO LUA code (using [aoconnect](https://www.npmjs.com/package/@permaweb/aoconnect))
- Shareable projects
- Offers a Notebook styled interface for quick development
- Modules to add functionality (e.g. graphs)
- Quick template and blueprint loading
- Easy process management and creation
- **Portable Codecells: We offer an npm package, using which anyone can integrate BetterIDEa codecells into their React webapps** [![npm](https://img.shields.io/badge/@betteridea/codecell-npm-red)](https://www.npmjs.com/package/@betteridea/codecell) [![downloads](https://img.shields.io/npm/dt/@betteridea/codecell?color=red)](https://www.npmjs.com/package/@betteridea/codecell)




## Tech Stack

- NextJS, Typescript, TailwindCSS, Zustand
- AOConnect
- Monaco Editor
- Xterm.js

## Run it yourself

### Prerequisites

- Node.js LTS & pnpm
- Arweave Web Wallet (ArConnect)

### Fork, Clone, Install and Run

```bash
git clone git@github.com:<YOUR_USERNAME>/ide.git betteridea
cd betteridea
pnpm install
pnpm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) as simple as that!

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
