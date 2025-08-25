const Constants = {
    schedulers: {
        testnet: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        mainnet: ""
    },
    modules: {
        testnet: {
            default: "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s",
            sqlite: "ei1VSwheQnNIG87iqlwxiQk-sWY5ikj4DFBxcpFZ-S4",
            aolearn: "qG-uo90351vUF7WPmUcObFtk7NU1isZYdPS0r2yQdKY"
        },
        mainnet: {
            hyperAos: "xVcnPK8MPmcocS6zwq1eLmM2KhfyarP8zzmz3UVi1g4"
        }
    },
    tags: {
        common: {
            'app-name': 'betteridea',
            // @ts-ignore // populated by vite on build
            'app-version': (typeof version !== 'undefined' ? version : "dev"),
            // @ts-ignore // populated by vite on build
            'app-build': (typeof gitCommit !== 'undefined' ? gitCommit : "dev")
        }

    },
    apmProcess: "RLvG3tclmALLBCrwc17NqzNFqZCrUf3-RKZ5v8VRHiU",
    authorities: ['fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY', "QWg43UIcJhkdZq6ourr1VbnkwcP762Lppd569bKWYKY"]
}

export default Constants