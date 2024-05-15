
const words = [
    "winston",
    "dumdum",
    "pikachu",
    "bulbasaur",
    "charmander",
    "squirtle",
    "jigglypuff",
    "buildooor",
    "(^･o･^)ﾉ' ",
    "ฅ^•ﻌ•^ฅ",
    "(⁠ ⁠╹⁠▽⁠╹⁠ ⁠)",
    "(⁠≧⁠▽⁠≦⁠)",
    "<⁠(⁠￣⁠︶⁠￣⁠)⁠>",
    "＼⁠(⁠^⁠o⁠^⁠)⁠／",
    "/⁠ᐠ⁠｡⁠ꞈ⁠｡⁠ᐟ⁠\\",
    "/⁠╲⁠/⁠\\⁠╭⁠(⁠•⁠‿⁠•⁠)⁠╮⁠/⁠\⁠\╱⁠\\",
    "▼⁠・⁠ᴥ⁠・⁠▼",
    "〜⁠(⁠꒪⁠꒳⁠꒪⁠)⁠〜",
    "(⁠⁠‾⁠▿⁠‾⁠)⁠",
    "\⁠(⁠ϋ⁠)⁠/⁠♩",
    "ᕙ⁠(⁠ ⁠ ⁠•⁠ ⁠‿⁠ ⁠•⁠ ⁠ ⁠)⁠ᕗ",
    "ᕙ⁠(⁠ ͡⁠°⁠ ͜⁠ʖ⁠ ͡⁠°⁠)⁠ᕗ",
    "⁄⁠(⁠⁄⁠ ⁠⁄⁠•⁠⁄⁠-⁠⁄⁠•⁠⁄⁠ ⁠⁄⁠)⁠⁄"
]

const cat = `
ᓚᘏᗢ
`

export default function WarpLanding() {
    return <>
        <section className="container p-24 my-16">
            <div className="flex flex-col gap-5 items-center">

                <h1 className="text-6xl font-bold" suppressHydrationWarning>gm {
                    words[Math.floor(Math.random() * words.length)]
                }</h1>

                <p className="text-lg text-muted-foreground">
                    Welcome to the intuitive web IDE for building powerful <span className="text-primary">actor oriented</span> applications.
                </p>

                <div className="flex flex-col text-center gap-x-4 mt-8">
                    <h1 className="px-8">Create a new project from the sidebar</h1>
                    <h1 className="px-8">
                        Or open an existing one ;)
                    </h1>
                </div>
            </div>
        </section>
    </>
}