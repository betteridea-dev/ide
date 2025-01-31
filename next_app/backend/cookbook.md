# Cookbook Documentation
## File: community/index.md
```
# Community Guides and Links

## Guides

- [0rbit](/guides/0rbit/index)
- [BetterIdea](/guides/betteridea/index)

## AO Packages

- [AO Package Manager](https://apm_betteridea.arweave.net)

## Links

- [Autonomous Finance](https://www.autonomous.finance/)

## Notes

> Not seeing an AO Community Member? Create an issue or submit a pull request to add your community member guide or link. https://github.com/permaweb/ao-cookbook

```

## File: concepts/holographic-state.md
```
TODO

```

## File: concepts/how-it-works.md
```
# How ao messaging works

Before we dive in to ao, I want to share with you a little information about unix. Unix is a powerful operating system, but in its design it is focused on two Principal "Types". Files and Programs. A File is data and a program is logic, when you combine the two you get information.

`Input.file | TransformProgram | Output.file`

You may have done something like this on the command line without knowing what you are doing. Being able to connect files to programs and return files which can then be passed to other programs creates a complex system composed of simple applications. This is a very powerful idea.

Now, lets talk about `ao` the hyper parallel computer, and lets change the idea of a File to the `ao` concept of a Message and the idea of a Program to the `ao` concept of a Process. The `ao` computer takes messages and sends them to Processes in which those Processes can output messages that can be sent to other Processes. The result is a complex system built on simple modular logic containers.

`MessageA | Process | MessageB`

![ao-messages](https://g8way.io/eAoqMqhwQ5vnpH_NJ6H2PiGgrcGDprtDIUH9Re2xcic)

Here is a description of the process as outlined in the flowchart:

1. A message is initiated from an ao Connect. This message is sent to the `mu` service using a POST request. The body of the request contains data following a protocol, labeled 'ao', and is of the type 'Message'.

2. The `mu` service processes the POST request and forwards the message to the `su` service. This is also done using a POST request with the same data protocol and message type.

3. The `su` service stores the assignment and message on Arweave.

4. A GET request is made to the `cu` service to retrieve result based on a message ID. The `cu` is a service that evaluates messages on processes and can return result based on an individual message identifier.

5. A GET request is made to the `su` service to retrieve the assignment and message. This request is looking for messages from a process ID, within a range of time from a start (from the last evaluation point) to (to the current messageId).

6. The final step is to push any outbox Messages. It involves reviewing the messages and spawns in the Result Object. Based on the outcome of this check, the steps 2, 3, and 4 may be repeated for each relevant message or spawn.

```

## File: concepts/index.md
```
---
prev:
  text: "First POST Request"
  link: "../guides/0rbit/post-request"
next:
  text: "Specifications"
  link: "./specs"
---

# Concepts

ao has a lot of concepts built into the design, but the core concepts are very simple principles:

- Two core types: Messages and Processes
- No shared state, only Holographic State
- Decentralized Computer (Grid)

Below is a set of concept documents that break down the ao system into its distinct parts.

- [Specifications](specs)
- [Processes](processes)
- [Messages](messages)
- [Units](units)
- [How messaging works](how-it-works)

[[toc]]

```

## File: concepts/lua.md
```
# A whistle stop tour of Lua.

Before we can explore ao in greater depth, let's take a moment to learn the basics of Lua: your companion for commanding aos processes.

Lua is a simple language with few surprises. If you know Javascript, it will feel like a simplified, purer version. If you are learning from-scratch, it will seem like a tiny language that focuses on the important stuff: Clean computation with sane syntax.

In this section we will cover the basics of Lua in just a few minutes. If you already know Lua, jump right through to the [next chapter]()

## Jumping back into your aos process.

For the purpose of this tutorial, we will be assuming that you have already completed the [getting started](/welcome/getting-started) guide. If not, complete that first.

If you logged out of your process, you can always re-open it by running `aos` on your commandline, optionally specifying your key file with `--wallet [location]`.

## Basic Lua expressions.

In the remainder of this primer we will quickly run through Lua's core features and syntax.

Try out on the examples on your aos process as you go, or skip them if they are intuitive to you.

- **Basic arithmetic**: Try some basic arithmetic, like `5 + 3`. After processing, you will see the result `8`. `+`, `-`, `*`, `/`, and `^` all work as you might expect. `%` is the symbol that Lua uses for modulus.
- **Setting variables**: Type `a = 10` and press enter. This sets the variable `a` to 10. By convention (not enforced by the language), global variables start with a capital letter in Lua (for example `Handlers`).

- **Using variables**: Now type `a * 2`. You will see `20`returned on the command line.
- **String concatenation**: Say hello to yourself by executing `"Hello, " .. ao.id`.

## Experimenting with conditional statements.

- **If-Else**: Like most programming languages, Lua uses if-else blocks to conditionally execute code.

  In your aos process, type `.editor` and press enter. This will open an in-line text editor within your command-line interface.

  ```lua
  aos_coolness = 9001
  if aos_coolness > 9000 then
      return "aos is coolness is over 9000!"
  else
      return "Oh. 🤷"
  end
  ```

  Once you are finished editing on your terminal, type `.done` on a new line and press enter. This will terminate edit mode and submit the expression to your process for evaluation.

  As a result, you will see that aos is >9,000 cool. Good to know.

  `if` statements in Lua can also have additional `elseif [condition] then` blocks, making conditional execution hierarchies easier.

## Looping in Lua.

There are a few different ways to loop in your code in Lua. Here are our favorites:

- **While loops**:

  Start by initializing your counter to zero by typing `n = 0` and pressing enter.

  Then open the inline editor again with `.editor` .

  ```lua
  while n < 5 do
    n = n + 1
  end
  ```

  Type `.done` on a new line to execute the while loop. You can check the result of the loop by simply running `n`.

- **For loops**:

  Lua can also execute python-style `for` loops between a set of values. For example, use the `.editor` to enter the following code block:

  ```lua
  for m = 1, 100 do
          n = n + m
  end
  ```

  Request the new value of the variable by running `n` again.

## Getting functional.

- **Define a function**:

  Using the `.editor` once again, submit the following lines:

  ```lua
  function greeting(name)
      return "Hello, " .. name
  end
  ```

  Once submitted, aos will return `undefined`, as function (and variable) definition in Lua doesn't return a value.

  Lua also has 'anonymous' or 'higher order' functions. These essentially allow you to use functions themselves as if they are normal data -- to be passed as arguments to other functions, etc. The following example defines an anonymous function and is equivalent to the above:

  ```lua
  greeting =
  		function(name)
      	return "Hello, " .. name
  		end
  ```

- **Calling the function**: Call the function with `greeting("Earthling")`. aos will return `"Hello, Earthling"`.

## Defining deep objects with tables.

Tables are Lua's only compound data structure. They map `keys` to `values`, but can also be used like traditional arrays.

- **Create a simple table**: Type `ao_is = {"hyper", "parallel", "compute"}`to create a simple table.
- **Accessing the table's elements**: Access an element with `ao_is[2]`. aos will return `parallel`. Note: Indices in Lua start from 1!
- **Count a table's elements**: The size of a table in Lua is found with the operator `#`. For example, running `#ao_is` will return `3`.
- **Set a named element**: Type `ao_is["cool"] = true` to add a new named key to the table. Named elements can also be accessed with the `.` operator, for example `ao_is.cool`.

## Lua Wats.

aos uses Lua because it is a simple, clean language that most experienced programmers can learn very quickly, and is an increasingly popular first programming language, too, thanks to its use in video games like Roblox.

Nonetheless, there are a few things about the language that are prone to trip up rookie Lua builders. Tastes may vary, but here is our exhaustive list of Lua [wat](https://www.destroyallsoftware.com/talks/wat)s:

- **Remember:** Table indexing starts from 1 not 0!
- **Remember:** 'Not equals' is expressed with `~=`, rather than `!=` or similar.
- **Remember:** Objects in Lua are called 'tables', rather than their more common names.

## Let's go!

With this in mind, you now know everything you need in order to build awesome decentralized processes with Lua! In the next chapter we will begin to build parallel processes with Lua and aos.

```

## File: concepts/messages.md
```
# Messages

The Message serves as the fundamental data protocol unit within ao, crafted from [ANS-104 DataItems](https://specs.g8way.io/?tx=xwOgX-MmqN5_-Ny_zNu2A8o-PnTGsoRb_3FrtiMAkuw), thereby aligning with the native structure of Arweave. When engaged in a Process, a Message is structured as follows:

```lua
{
    Cron = false,
    Data = "Hello aos",
    Epoch = 0,
    From = "5WzR7rJCuqCKEq02WUPhTjwnzllLjGu6SA7qhYpcKRs",
    Id = "ayVo53qvZswpvxLlhMf8xmGjwxN0LGuHzzQpTLT0_do",
    Nonce = 1,
    Owner = "z1pq2WzmaYnfDwvEFgUZBj48anUsxxN64ZjbWOsIn08",
    Signature = "...",
    Tags = {
        Type = "Message",
        Variant = "ao.TN.1",
        ["Data-Protocol"] = "ao",
        ["From-Module"] = "lXfdCypsU3BpYTWvupgTioLoZAEOZL2_Ihcqepz6RiQ",
        ["From-Process"] = "5WzR7rJCuqCKEq02WUPhTjwnzllLjGu6SA7qhYpcKRs"
    },
    Target = "5WzR7rJCuqCKEq02WUPhTjwnzllLjGu6SA7qhYpcKRs",
    Timestamp = 1704936415711,
    ["Block-Height"] = 1340762,
    ["Forwarded-By"] = "z1pq2WzmaYnfDwvEFgUZBj48anUsxxN64ZjbWOsIn08",
    ["Hash-Chain"] = "hJ0B-0yxKxeL3IIfaIIF7Yr6bFLG2vQayaF8G0EpjbY"
}
```

This architecture merges the Assignment Type with the Message Type, granting the Process a comprehensive understanding of the Message's context for effective processing.

When sending a message, here is a visual diagram of how the messages travels through the ao computer.

![Message Workflow](message-workflow-diagram.png)

The message workflow initiates with the MU (Messenger Unit), where the message's signature is authenticated. Following this, the SU (Scheduler Unit) allocates an Epoch and Nonce to the message, bundles the message with an Assignment Type, and dispatches it to Arweave. Subsequently, the `aoconnect` library retrieves the outcome from the CU (Compute Unit). The CU then calls for all preceding messages leading up to the current Message Id from the SU (Scheduler Unit), processes them to deduce the result. Upon completion, the computed result is conveyed back to `aoconnect`, which is integrated within client interfaces such as `aos`.

## Ethereum Signed Message

If the Message [ANS-104 DataItem](https://specs.g8way.io/?tx=xwOgX-MmqN5_-Ny_zNu2A8o-PnTGsoRb_3FrtiMAkuw) was signed using Ethereum keys,
then the value in the `Owner` and `From` fields will be the
[EIP-55](https://github.com/ethereum/ercs/blob/master/ERCS/erc-55.md) Ethereum address of the signer.
For example: `0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359`.

## Summary

Messages serve as the primary data protocol type for the ao network, leveraging ANS-104 Data-Items native to Arweave. Messages contain several fields including data content, origin, target, and cryptographic elements like signatures and nonces. They follow a journey starting at the Messenger Unit (MU), which ensures they are signed, through the Scheduler Unit (SU) that timestamps and sequences them, before being bundled and published to Arweave. The `aoconnect` library then reads the result from the Compute Unit (CU), which processes messages to calculate results and sends responses back through `aoconnect`, utilized by clients such as `aos`. The CU is the execution environment for these processes.

```

## File: concepts/processes.md
```
# Processes

Processes possess the capability to engage in communication via message passing, both receiving and dispatching messages within the network. Additionally, they hold the potential to instantiate further processes, enhancing the network's computational fabric. This dynamic method of data dissemination and interaction within the network is referred to as a 'holographic state', underpinning the shared and persistent state of the network.

![Process-Diagram](process-diagram.png)

When building a Process with `aos` you have the ability to add `handlers`, these handlers can be added by calling the `Handlers.add` function, passing a "name", a "match" function, and a "handle" function.

![Handler Diagram](handler-diagram.png)

The core module contains a helper library that gets injected into the handler function, this library is called `ao`.

```lua
{
    env = {
        Process = {
            Id = "5WzR7rJCuqCKEq02WUPhTjwnzllLjGu6SA7qhYpcKRs",
            Owner = "_r9LpP4FtClpsGX3TOohubyaeb0IQTZZMcxQ24tTsGo",
            Tags = {...}
        },
        Module = {
            Id = "UAUszdznoUPQvXRbrFuIIH6J0N_LnJ1h4Trej28UgrE",
            Owner = "_r9LpP4FtClpsGX3TOohubyaeb0IQTZZMcxQ24tTsGo",
            Tags = {..}
        }
    },
    id = "5WzR7rJCuqCKEq02WUPhTjwnzllLjGu6SA7qhYpcKRs",
    isTrusted = "function: 0x5468d0",
    result = "function: 0x547120",
    send = "function: 0x547618",
    spawn = "function: 0x5468b0"
}
```

The main functions to look at in this `ao` helper is

- ao.send(Message) - sends a message to a process
- ao.spawn(Module, Message) - creates a new process

## Ethereum Signed Process or Module

For an `ao` `Process` or `Module`, if the [ANS-104 DataItem](https://specs.g8way.io/?tx=xwOgX-MmqN5_-Ny_zNu2A8o-PnTGsoRb_3FrtiMAkuw) was signed using Ethereum keys,
then the value in the `env.Process.Owner` or `env.Module.Owner` field, respectively, will be the
[EIP-55](https://github.com/ethereum/ercs/blob/master/ERCS/erc-55.md) Ethereum address of the signer.
For example: `0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359`

## ao.send Example

```lua
ao.send({
    Target = Chatroom,
    Action = "Broadcast",
    Data = "Hello from my Process!"
})
```

## ao.spawn Example

```lua
ao.spawn(ao.env.Module.Id, {
    ["Memory-Limit"] = "500-mb",
    ["Compute-Limit"] = "900000000000000000"
})
```

## ao.env

> NOTE: `ao.env` is important context data that you may need as a developer creating processes.

The `ao.env` property contains the `Process` and `Module` Reference Objects

```lua
env = {
    Process = {
        Id = "5WzR7rJCuqCKEq02WUPhTjwnzllLjGu6SA7qhYpcKRs",
        Owner = "_r9LpP4FtClpsGX3TOohubyaeb0IQTZZMcxQ24tTsGo",
        Tags = {...}
    },
    Module = {
        Id = "UAUszdznoUPQvXRbrFuIIH6J0N_LnJ1h4Trej28UgrE",
        Owner = "_r9LpP4FtClpsGX3TOohubyaeb0IQTZZMcxQ24tTsGo",
        Tags = {..}
    }
}
```

Both the `Process` and the `Module` contain the attributes of the `ao` Data-Protocol.

## Summary

Processes in the network communicate through message passing and can create new processes, contributing to a 'holographic state' of shared and persistent data. Developers can build a Process using `aos` by adding handlers through the `Handlers.add` function with specific name, match, and handle functions. The `ao` helper library within the core module aids in this process, providing functions like `ao.send` to dispatch messages and `ao.spawn` to create new modules, as well as the important `ao.env` property which contains essential Process and Module information. The `ao` Data-Protocol outlines the structure and attributes of these elements.

```

## File: concepts/specs.md
```
# ao Specs

### What is `ao`?

The `ao` computer is the [actor oriented](https://en.wikipedia.org/wiki/Actor_model) machine that emerges from the network of nodes that adhere to its core data protocol, running on the [Arweave](https://arweave.org) network. This document gives a brief introduction to the protocol and its functionality, as well as its technical details, such that builders can create new implementations and services that integrate with it.

The `ao` computer is a single, unified computing environment (a [Single System Image](https://en.wikipedia.org/wiki/Single_system_image)), hosted on a heterogenous set of nodes in a distributed network. `ao` is designed to offer an environment in which an arbitrary number of parallel processes can be resident, coordinating through an open message passing layer. This message passing standard connects the machine's independently operating processes together into a 'web' -- in the same way that websites operate on independent servers but are conjoined into a cohesive, unified experience via hyperlinks.

[Learn More](https://ao.g8way.io/#/read)

```

## File: concepts/tour.md
```
# aos Brief Tour

Welcome to a quick tour of aos! This tutorial will walk you through the key global functions and variables available in the aos environment, giving you a foundational understanding of how to interact with and utilize aos effectively.

## 1. Introduction to Inbox

- **What It Is**: `Inbox` is a Lua table that stores all messages received by your process but not yet handled.
- **How to Use**: Check `Inbox` to see incoming messages. Iterate through `Inbox[x]` to process these messages.

## 2. Sending Messages with Send(Message)

- **Functionality**: `Send(Message)` is a global function to send messages to other processes.
- **Usage Example**: `Send({Target = "...", Data = "Hello, Process!"})` sends a message with the data "Hello, Process!" to a specified process.

## 3. Creating Processes with Spawn(Module, Message)

- **Purpose**: Use `Spawn(Module, Message)` to create new processes.
- **Example**: `Spawn("MyModule", {Data = "Start"})` starts a new process using "MyModule" with the provided message.

## 4. Understanding Name and Owner

- **Name**: A string set during initialization, representing the process's name.
- **Owner**: Indicates the owner of the process. Changing this might restrict your ability to interact with your process.
- **Important Note**: Treat these as read-only to avoid issues.

## 5. Utilizing Handlers

- **What They Are**: `Handlers` is a table of helper functions for creating message handlers.
- **Usage**: Define handlers in `Handlers` to specify actions for different incoming messages based on pattern matching.

## 6. Data Representation with Dump

- **Function**: `Dump` converts any Lua table into a print-friendly format.
- **How to Use**: Useful for debugging or viewing complex table structures. Example: `Dump(Inbox)` prints the contents of `Inbox`.

## 7. Leveraging Utils Module

- **Contents**: Utils contains a collection of functional utilities like`map`, `reduce`, and `filter`.

- **Usage**: Great for data manipulation and functional programming patterns in Lua. For example, `Utils.map(myTable, function(x) return x * 2 end)` to double the values in a table.

## 8. Exploring the ao Core Library

- **Description**: `ao` is a core module that includes key functions for message handling and process management.
- **Key Features**: Includes functions for sending messages (`send`) and spawning processes (`spawn`), along with environment variables.

## Conclusion

This brief tour introduces you to the primary globals and functionalities within the aos environment. With these tools at your disposal, you can create and manage processes, handle messages, and utilize Lua's capabilities to build efficient and responsive applications on the aos platform. Experiment with these features to get a deeper understanding and to see how they can be integrated into your specific use cases. Happy coding in aos!

```

## File: concepts/units.md
```
# Units


## What is a Unit?

The ao Computer is composed of three Unit types, each type contains a set of responsibilities for the computer. And each Unit is horizontally scalable.

In ao we have the `Messager Unit` or `MU`, and the `Scheduler Unit` or `SU`, and the `Compute Unit` or the `CU`. These units are the building blocks of the ao Computer Grid. There can be 1 or more of these units on the network and they work together to power the ao Operating System or `aos`.

![MU](MU-diagram.png)

- Messager Unit - This unit is the front door to ao, it receives all the messages from the outside and as well as directs traffic flow for Processes. This traffic flow we call `pushing`. Each process can return an Outbox when it evaluates a Message, and this Outbox can be filled with Messages or requests to Spawn new processes, and the Messenger Unit is responsible for extracting these Messages from the Outbox and signing them and sending them to the Scheduler Units for processing.

![SU Diagram](SU-diagram.png)

- Scheduler Unit - The Scheduler unit is responsible for ordering the messages, and storing those messages on Arweave. It is important that every message is appropriately ordered so that the evaluation can be replayed and verified. The Scheduler Unit is responsible for this process. It provides the abilty to query it via an endpoint to get the order of messages for evaluation.

![CU Diagram](CU-diagram.png)

- Compute Unit - The Compute unit is responsible for compute, this unit loads the binary module and manages the memory of that module, so that the execution of the process is alway running on the most up to date memory. The compute unit provides the results of the evaluation back to the the messenger unit, which can then push any messages in the outbox of the given process.

## Summary

The ao Computer consists of three scalable unit types—Messager Unit (MU), Scheduler Unit (SU), and Compute Unit (CU)—which form the foundation of the ao Computer. These units can exist in multiples on the network and collectively operate the ao Operating System (aos).

The MU acts as the entry point, receiving external messages and managing process communications. It processes outgoing messages and spawn requests from process outboxes and forwards them to the SU.

The SU ensures messages are properly sequenced and stored on Arweave, maintaining order for consistent replay and verification of message evaluations.

The CU handles computation, loading binary modules, and managing memory to ensure processes run with current data. It then returns the evaluation results to the MU for further message handling.

```

## File: guides/0rbit/get-request.md
```
---
prev:
  text: "0rbit"
  link: "/guides/0rbit/index"
next:
  text: "First POST Request"
  link: "/guides/0rbit/post-request"
---

# First GET Request

In this tutorial, we will learn how to make a GET request to the **0rbit network** through your `ao` process.

## 🔑 Prerequisites

- aos installed on your system.
- Some $0RBT. _Learn how to get $0RBT [here](https://docs.0rbit.co/protocol/token/how-to-get)_
- Any Code Editor (VSCode, Sublime Text, etc)

If you are ready with the above prerequisites,

## 🛠️ Let's Start Building

### Initialize the Project

Create a new file named `0rbit-Get-Request.lua` in your project directory.

```bash
touch 0rbit-Get-Request.lua
```

### Initialize the Variables

```lua
local json = require("json")

_0RBIT = "BaMK1dfayo75s3q1ow6AO64UDpD9SEFbeE8xYrY2fyQ"
_0RBT_POINTS = "BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc"

FEE_AMOUNT = "1000000000000" -- 1 $0RBT
BASE_URL = "https://api.diadata.org/v1/assetQuotation/Arweave/0x0000000000000000000000000000000000000000"

ReceivedData = ReceivedData or {}
```

### Make the Request

The following code contains the Handler that will send 1 $0RBT to the `0rbit` process and make the GET request for the `BASE_URL`

```lua
Handlers.add(
    "Get-Request",
    Handlers.utils.hasMatchingTag("Action", "First-Get-Request"),
    function(msg)
        Send({
            Target = _0RBT_TOKEN,
            Action = "Transfer",
            Recipient = _0RBIT,
            Quantity = FEE_AMOUNT,
            ["X-Url"] = BASE_URL,
            ["X-Action"] = "Get-Real-Data"
        })
        print(Colors.green .. "You have sent a GET Request to the 0rbit process.")
    end
)
```

Breakdown of the above code:

- `Handlers.add` is used to add a new handler to the `ao` process.
- **Get-Request** is the name of the handler.
- `Handlers.utils.hasMatchingTag` is a function that checks if the incoming message has the matching tag same as the **First-Get-Request**.
- `function(msg)` is the function executed when the handler is called.
- `Send` is the function that takes several tags as the arguments and creates a message on the ao:

  | **Tag**      |                                                        **Description**                                                        |
  | :----------- | :---------------------------------------------------------------------------------------------------------------------------: |
  | Target       |                         The processId of the recipient. In this case, it's the $0RBT token processId.                         |
  | Action       |             The tag that defines the handler to be called in the recipient process. In this case it's `Transfer`              |
  | Recipient    |          The tag that accepts the processId to whom the $0RBT will be sent. In this case, it's the 0rbit processId.           |
  | Quantity     |                                                The amount of $0RBT to be sent.                                                |
  | ["X-Url"]    |       The _forwarded-tag_ which contains the URL and the same will be used by the **0rbit process** to fetch the data.        |
  | ["X-Action"] | The _forwarded-tag_ which contains the action to be performed by the **0rbit process**. In this case, it's **Get-Real-Data**. |

### Receive Data

The following code contains the Handler that will receive the data from the `0rbit` process and print it.

```lua
Handlers.add(
    "Receive-Data",
    Handlers.utils.hasMatchingTag("Action", "Receive-Response"),
    function(msg)
        local res = json.decode(msg.Data)
        ReceivedData = res
        print(Colors.green .. "You have received the data from the 0rbit process.")
    end
)
```

Breakdown of the above code:

- `Handlers.add` is used to add a new handler to the `ao` process.
- **Receive-Data** is the name of the handler.
- `Handlers.utils.hasMatchingTag` is a function that checks if the incoming message has the matching tag same as the **Receive-Response**.
- `function(msg)` is the function executed when the handler is called.
  - `json.decode` is used to decode the JSON data received.
  - `ReceivedData = res` stores the received data in the `ReceivedData` variable.

## 🏃 Run the process

### Create a new process and load the script

```bash
aos 0rbitGetRequest --load 0rbit-Get-Request.lua
```

The above command will create a new process with the name **0rbitGetRequest** and load `0rbit-Get-Request.lua` into it.

### Call the Handler

Call the handler, who will create a request for the 0rbit process.

```bash
Send({ Target= ao.id, Action="First-Get-Request" })
```

Upon the successful execution, you will receive the following messages in your terminal

### Check the Data

To check the data stored in the `ReceivedData` variable, run the following command:

```bash
ReceivedData
```

Upon the successful execution, you will receive the JSON data in your terminal:

```json
{
   Address = "0x0000000000000000000000000000000000000000",
   Name = "Arweave",
   Blockchain = "Arweave",
   Signature = "0x2cd98c6f29a044d732ffcbc1a1b11e6f93f97f760dd1c9e47717ca04cc500afd6d83ad65270b227ddbaeba713e329e31959c814620d8ca136e685565414673d101",
   Time = "2024-08-14T14:05:59Z",
   Source = "diadata.org",
   PriceYesterday = 21.446763148012,
   Symbol = "AR",
   Price = 21.404398988798,
   VolumeYesterdayUSD = 14609998.02428
}
```

---

**_Voila! You have successfully made your first GET request on the 0rbit process. 🎉_**

> You can find the complete code here:
>
> https://github.com/0rbit-co/examples/blob/main/First-Get-Request.lua

```

## File: guides/0rbit/index.md
```
---
prev:
  text: "Bots and Games"
  link: "/guides/aoconnect/monitoring-cron"
next:
  text: "First GET Request"
  link: "/guides/0rbit/get-request"
---

# 0rbit 💫

[0rbit](https://0rbit.co/) is the first-ever Decentralised Oracle Network on Arweave using `ao`.

0rbit enables Access to ANY Real-World data present and accessible across internet into your `ao` process.

0rbit provides the following features to get access to the data using the HTTP protocol:

- [**Fetch HTTP Data**](https://docs.0rbit.co/developer/get-request): A handler to make a HTTP Get Request from your `ao` process to the web.
- [**Post HTTP Data**](https://docs.0rbit.co/developer/post-request): A handler to make a HTTP Post Request from your `ao` process to the web.

## Tutorials

Learn how to build with 0rbit with the following tutorials:

- [First GET Request](./get-request.md)
- [First POST Request](./post-request.md)

> _Learn more about 0rbit through the [developer docs.](https://docs.0rbit.co/)_

```

## File: guides/0rbit/post-request.md
```
---
prev:
  text: "0rbit"
  link: "/guides/0rbit/get-request"
next:
  text: "BetterIDEa IDE"
  link: "../betteridea/index.md"
---

# First POST Request

In this tutorial, we will learn how to make a POST request on `0rbit` process.

## 🔑 Prerequisites

- aos installed on your system.
- Some $0RBT. _Learn how to get $0RBT [here](https://docs.0rbit.co/protocol/token/how-to-get)_
- Any Code Editor (VSCode, Sublime Text, etc)

If you are ready with the above prerequisites,

## 🛠️ Let's Start Building

### Initialize the Project

Create a new file named `0rbit-Post-Request.lua` in your project directory.

```bash
touch 0rbit-Post-Request.lua
```

### Initialize the Variables

```lua
local json = require("json")

_0RBIT = "BaMK1dfayo75s3q1ow6AO64UDpD9SEFbeE8xYrY2fyQ"
_0RBT_POINTS = "BUhZLMwQ6yZHguLtJYA5lLUa9LQzLXMXRfaq9FVcPJc"

FEE_AMOUNT = "1000000000000" -- 1 $0RBT
BASE_URL = "https://arweave.dev/graphql"
-- The data body to be sent in the POST request
BODY = json.encode({
    query = [[
        query {
            transactions(
                owners: ["vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"]
            ) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    ]]
});

ReceivedData = ReceivedData or {}
```

### Make the Request

The following code contains the Handler that will send 1 $0RBT to the `0rbit` process and make the POST request for the `BASE_URL`

```lua
Handlers.add(
    "Post-Request",
    Handlers.utils.hasMatchingTag("Action", "First-Post-Request"),
    function(msg)
        Send({
            Target = _0RBT_TOKEN,
            Action = "Transfer",
            Recipient = _0RBIT,
            Quantity = FEE_AMOUNT,
            ["X-Url"] = BASE_URL,
            ["X-Action"] = "Post-Real-Data",
            ["X-Body"] = BODY
        })
        print(Colors.green .. "You have sent a POST Request to the 0rbit process.")
    end
)
```

Breakdown of the above code:

- `Handlers.add` is used to add a new handler to the `ao` process.
- Post-Request\_\_ is the name of the handler.
- `Handlers.utils.hasMatchingTag` is a function that checks if the incoming message has the matching tag same as the **First-Post-Request**.
- `function(msg)` is the function executed when the handler is called.
- `Send` is the function that takes several tags as the arguments and creates a message on the ao:

  | **Tag**      |                                                        **Description**                                                         |
  | :----------- | :----------------------------------------------------------------------------------------------------------------------------: |
  | Target       |                         The processId of the recipient. In this case, it's the $0RBT token processId.                          |
  | Action       |              The tag that defines the handler to be called in the recipient process. In this case it's `Transfer`              |
  | Recipient    |           The tag that accepts the processId to whom the $0RBT will be sent. In this case, it's the 0rbit processId.           |
  | Quantity     |                                                The amount of $0RBT to be sent.                                                 |
  | ["X-Url"]    |        The _forwarded-tag_ which contains the URL and the same will be used by the **0rbit process** to fetch the data.        |
  | ["X-Action"] | The _forwarded-tag_ which contains the action to be performed by the **0rbit process**. In this case, it's **Post-Real-Data**. |
  | ["X-Body"]   |                        The _forwarded-tag_ which contains the data body to be sent in the POST request.                        |

### Receive Data

The following code contains the Handler that will receive the data from the `0rbit` process and print it.

```lua
Handlers.add(
    "Receive-Data",
    Handlers.utils.hasMatchingTag("Action", "Receive-Response"),
    function(msg)
        local res = json.decode(msg.Data)
        ReceivedData = res
        print(Colors.green .. "You have received the data from the 0rbit process.")
    end
)
```

Breakdown of the above code:

- `Handlers.add` is used to add a new handler to the `ao` process.
- **Receive-Data** is the name of the handler.
- `Handlers.utils.hasMatchingTag` is a function that checks if the incoming message has the matching tag same as the **Receive-Response**.
- `function(msg)` is the function executed when the handler is called.
  - `json.decode` is used to decode the JSON data received.
  - `ReceivedData = res` stores the received data in the `ReceivedData` variable.

The 0rbit process always sends the data in the `string` format.
`json.decode` is used above because we know the receiving data, i.e., stringified JSON.
So, you need to decode the data as per your requirements.

## 🏃 Run the process

### Create a new process and load the script

```bash
aos 0rbitPostRequest --load 0rbit-Post-Request.lua
```

The above command will create a new process with the name **0rbitPostRequest** and load `0rbit-Post-Request.lua` into it.

### Fund your process

Transfer some $0RBT to your processID.

### Call the Handler

Call the handler, who will create a request for the 0rbit process.

```bash
Send({ Target= ao.id, Action="First-Post-Request" })
```

### Check the Data

To check the data stored in the `ReceivedData` variable, run the following command:

```bash
ReceivedData
```

Upon the successful execution, you will receive the JSON data in your terminal:

```json
{
    data = {
        transactions = {
        edges = {
            {
            node = {
                id = "nH0NU9rgNqGVHwjtjFvnIyXpsP7YVrj_v7JxFErHNB4"
            }
            },
            //and so on...
            {
            node = {
                id = "9HLUVJo4AcrSxQeapf2hutS2Xp7hx_XDiIvv3vnxDcc"
            }
            }
        }
        }
    }
}
```

---

**_Voila! You have successfully made your first POST request on the 0rbit process. 🎉_**

> You can find the complete code here:
>
> https://github.com/0rbit-co/examples/blob/main/First-Post-Request.lua

```

## File: guides/aoconnect/aoconnect.md
```
---
prev:
  text: "aos"
  link: "/guides/aos"
next:
  text: "Installing aoconnect"
  link: "/guides/aoconnect/installing-connect"
---

# aoconnect

ao connect is a Javascript/Typescript library to interact with the system from Node JS or the browser.

Guides in this section provide snippets on how to utilize ao connect. All snippets are written in Javascript but should translate easily to Typescript.

```

## File: guides/aoconnect/assign-data.md
```
# Sending an Assignment to a Process

Assignments can be used to load Data from another Message into a Process. Or to not duplicate Messages. You can create one Message and then assign it to any number of processes. This will make it available to the Processes you have sent an Assignment to.

## Sending an Assignment in NodeJS

```js
import { readFileSync } from "node:fs";

import { assign } from "@permaweb/aoconnect";

await assign({
  process: "process-id",
  message: "message-id",
})
  .then(console.log)
  .catch(console.error);
```

## Excluding DataItem fields

You can also exclude most DataItem fields which will tell the CU not to load them into your process. You may want to do this if you need only the header data like the Tags and not the Data itself etc... If you exclude the Owner it wont have any effect because the CU requires the Owner, so excluding Owner will be ignored by the CU. Only capitalized DataItem/Message fields will have an effect in the CU.

```js
import { readFileSync } from "node:fs";

import { assign } from "@permaweb/aoconnect";

await assign({
  process: "process-id",
  message: "message-id",
  exclude: ["Data", "Anchor"],
})
  .then(console.log)
  .catch(console.error);
```

## Assigning L1 Transactions

You can also assign a layer 1 transaction by passing the baseLayer param into assign. This is useful for minting tokens etc... using the base layer. By default, if the L1 tx does not have at least 20 confirmations the SU will reject it. This can be changed by setting the `Settlement-Depth` tag to a different number on the Process when it is created.

```js
import { readFileSync } from "node:fs";

import { assign } from "@permaweb/aoconnect";

await assign({
  process: "process-id",
  message: "layer 1 tx id",
  baseLayer: true,
})
  .then(console.log)
  .catch(console.error);
```

```

## File: guides/aoconnect/calling-dryrun.md
```
# Calling DryRun

DryRun is the process of sending a message object to a specific process and getting the Result object back, but the memory is not saved, it is perfect to create a read message to return the current value of memory. For example, a balance of a token, or a result of a transfer, etc. You can use DryRun to obtain an output without sending an actual message.

```js
import { createDataItemSigner, dryrun } from "@permaweb/aoconnect";

const result = await dryrun({
  process: 'PROCESSID',
  data: '',
  tags: [{name: 'Action', value: 'Balance'},
  anchor: '1234',
  ...rest are optional (Id, Owner, etc)
});

console.log(result.Messages[0]);
```

```

## File: guides/aoconnect/connecting.md
```
# Connecting to specific ao nodes

When including ao connect in your code you have the ability to connect to a specific MU and CU, as well as being able to specify an Arweave gateway. This can be done by importing the "connect" function and extracting the functions from a call to the "connect" function.

You may want to do this if you want to know which MU is being called when you send your message so that later you can debug from the specified MU. You also may want to read a result from a specific CU. You may in fact just prefer a particular MU and CU for a different reason. You can specify the gateway in order to use something other than the default, which is arweave.net.

## Importing without a call to connect

```js
// Here aoconnect will implicitly use the default nodes/units
import {
  result,
  results,
  message,
  spawn,
  monitor,
  unmonitor,
  dryrun,
} from "@permaweb/aoconnect";
```

## Connecting to a specific MU, CU, and gateway

```js
import { connect } from "@permaweb/aoconnect";

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect(
  {
    MU_URL: "https://mu.ao-testnet.xyz",
    CU_URL: "https://cu.ao-testnet.xyz",
    GATEWAY_URL: "https://arweave.net",
  },
);

// now spawn, message, and result can be used the same way as if they were imported directly
```

<br>

<strong>All three of these parameters to connect are optional and it is valid to specify only 1 or 2 of them, or none. You could pass in just the MU_URL, for example.</strong>

```js
import { connect } from "@permaweb/aoconnect";

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect(
  {
    MU_URL: "https://ao-mu-1.onrender.com",
  },
);
```

```

## File: guides/aoconnect/installing-connect.md
```
# Installing ao connect

## Prerequisites

---

In order to install ao connect into your app you must have NodeJS/NPM 18 or higher.
<br>

## Installing

### npm

```sh
npm install --save @permaweb/aoconnect
```

### yarn

```sh
yarn add @permaweb/aoconnect -D
```

<br>

This module can now be used from NodeJS as well as a browser, it can be included as shown below.

#### ESM (Node & Browser) aka type: `module`

```js
import {
  result,
  results,
  message,
  spawn,
  monitor,
  unmonitor,
  dryrun,
} from "@permaweb/aoconnect";
```

#### CJS (Node) type: `commonjs`

```js
const {
  result,
  results,
  message,
  spawn,
  monitor,
  unmonitor,
  dryrun,
} = require("@permaweb/aoconnect");
```

```

## File: guides/aoconnect/monitoring-cron.md
```
# Monitoring Cron

When using cron messages, ao users need a way to start ingesting the messages, using this monitor method, ao users can initiate the subscription service for cron messages. Setting cron tags means that your process will start producing cron results in its outbox, but you need to monitor these results if you want messages from those results to be pushed through the network.

```js
import { readFileSync } from "node:fs";
import { createDataItemSigner, monitor } from "@permaweb/aoconnect";

const wallet = JSON.parse(
  readFileSync("/path/to/arweave/wallet.json").toString(),
);

const result = await monitor({
  process: "process-id",
  signer: createDataItemSigner(wallet),
});
```

You can stop monitoring by calling unmonitor

```js
import { readFileSync } from "node:fs";
import { createDataItemSigner, unmonitor } from "@permaweb/aoconnect";

const wallet = JSON.parse(
  readFileSync("/path/to/arweave/wallet.json").toString(),
);

const result = await unmonitor({
  process: "process-id",
  signer: createDataItemSigner(wallet),
});
```

```

## File: guides/aoconnect/reading-results.md
```
# Reading results from an ao Process

In ao, messages produce results which are made available by Compute Units (CU's). Results are JSON objects consisting of the following fields: messages, spawns, output and error.

Results are what the ao system uses to send messages and spawns that are generated by processes. A process can send a message just like you can as a developer, by returning messages and spawns in a result.

You may want to access a result to display the output generated by your message. Or you may want to see what messages etc., were generated. You do not need to take the messages and spawns from a result and send them yourself. They are automatically handled by Messenger Units (MU's). A call to `results` can also provide you paginated list of multiple results.

## Fetching a single result

```js
import { result } from "@permaweb/aoconnect";

let { Messages, Spawns, Output, Error } = await result({
  // the arweave TXID of the message
  message: "message-id",
  // the arweave TXID of the process
  process: "process-id",
});
```

## Fetching a set of results

```js
import { results } from "@permaweb/aoconnect";

// fetching the first page of results
let resultsOut = await results({
  process: "process-id",
  sort: "ASC",
  limit: 25,
});

// calling more with a cursor
let resultsOut2 = await results({
  process: "process-id",
  from: resultsOut.edges?.[resultsOut.edges.length - 1]?.cursor ?? null,
  sort: "ASC",
  limit: 25,
});
```

```

## File: guides/aoconnect/sending-messages.md
```
# Sending a Message to a Process

A deep dive into the concept of Messages can be found in the [ao Messages](../../concepts/messages.md) concept. This guide focuses on using ao connect to send a message to a process.

Sending a message is the central way in which your app can interact with ao. A message is input to a process. There are 5 parts of a message that you can specify which are "target", "data", "tags", "anchor", and finally the messages "signature".

Refer to your process module's source code or documentation to see how the message is used in its computation. The ao connect library will translate the parameters you pass it in the code below, construct a message, and send it.

> 🎓 To Learn more about Wallets visit the [Permaweb Cookbook](https://cookbook.g8way.io/concepts/keyfiles-and-wallets.html)

## Sending a Message in NodeJS

> Need a test wallet, use `npx -y @permaweb/wallet > /path/to/wallet.json` to create a wallet keyfile.

```js
import { readFileSync } from "node:fs";

import { message, createDataItemSigner } from "@permaweb/aoconnect";

const wallet = JSON.parse(
  readFileSync("/path/to/arweave/wallet.json").toString(),
);

// The only 2 mandatory parameters here are process and signer
await message({
  /*
    The arweave TXID of the process, this will become the "target".
    This is the process the message is ultimately sent to.
  */
  process: "process-id",
  // Tags that the process will use as input.
  tags: [
    { name: "Your-Tag-Name-Here", value: "your-tag-value" },
    { name: "Another-Tag", value: "another-value" },
  ],
  // A signer function used to build the message "signature"
  signer: createDataItemSigner(wallet),
  /*
    The "data" portion of the message
    If not specified a random string will be generated
  */
  data: "any data",
})
  .then(console.log)
  .catch(console.error);
```

## Sending a Message in a browser

> New to building permaweb apps check out the [Permaweb Cookbook](https://cookbook.arweave.net)

```js
import { message, createDataItemSigner } from "@permaweb/aoconnect";

// The only 2 mandatory parameters here are process and signer
await message({
  /*
    The arweave TXID of the process, this will become the "target".
    This is the process the message is ultimately sent to.
  */
  process: "process-id",
  // Tags that the process will use as input.
  tags: [
    { name: "Your-Tag-Name-Here", value: "your-tag-value" },
    { name: "Another-Tag", value: "another-value" },
  ],
  // A signer function used to build the message "signature"
  signer: createDataItemSigner(globalThis.arweaveWallet),
  /*
    The "data" portion of the message.
    If not specified a random string will be generated
  */
  data: "any data",
})
  .then(console.log)
  .catch(console.error);
```

If you would like to learn more about signers, [click here](signers)

```

## File: guides/aoconnect/signers.md
```
---
prev:
  text: "Sending Messages"
  link: "/guides/aoconnect/sending-messages"

next: false
---

# DataItem Signers

Every message sent to AO MUST be signed, aoconnect provides a helper function for signing messages or spawning new processes. This helper function `createDataItemSigner` is provided for arweave wallets. But you can create your own `Signer` instance too.

## What is a Wallet/Keyfile?

A wallet/keyfile is a public/private key pair that can be used to sign and encrypt data.

## What is an ao message/dataItem?

You often see the terms `message` and `dataItem` used interchangeably in the documentation, a message is a data-protocol type in ao that uses the dataItem specification to describe the messages intent. A dataItem is defined in the `ans-104` bundle specification. A dataItem is the preferred format of storage for arweave bundles. A bundle is a collection of these signed dataItems. A message implements specific tags using the dataItem specification. When developers send messages to ao, they are publishing dataItems on arweave.

> 🎓 To learn more about messages [click here](/concepts/messages) and to learn more about ans-104 dataItems [click here](https://specs.g8way.io/?tx=xwOgX-MmqN5_-Ny_zNu2A8o-PnTGsoRb_3FrtiMAkuw)

## What is a signer?

A signer is function that takes `data, tags, anchor, target` and returns an object of `id, binary` representing a signed dataItem. AO accepts arweave signers and ethereum signers. `createDataItemSigner` is a helper function that can take an arweave keyfile or a browser instance of an arweave wallet usually located in the global scope of the browser, when I user connects to a wallet using an extension or html app.

## Examples

arweave keyfile

> NOTE: if you do not have a wallet keyfile you can create one using `npx -y @permaweb/wallet > wallet.json`

```js
import * as WarpArBundles from "warp-arbundles";

const pkg = WarpArBundles.default ? WarpArBundles.default : WarpArBundles;
const { createData, ArweaveSigner } = pkg;

function createDataItemSigner(wallet) {
  const signer = async ({ data, tags, target, anchor }) => {
    const signer = new ArweaveSigner(wallet);
    const dataItem = createData(data, signer, { tags, target, anchor });
    return dataItem.sign(signer).then(async () => ({
      id: await dataItem.id,
      raw: await dataItem.getRaw(),
    }));
  };

  return signer;
}
```

arweave browser extension

> NOTE: This implementation works with [ArweaveWalletKit](https://docs.arweavekit.com/wallets/wallet-kit), [ArConnect](https://www.arconnect.io/), and [Arweave.app](https://jfbeats.github.io/ArweaveWalletConnector/)

```js
import { Buffer } from "buffer/index.js";
import * as WarpArBundles from "warp-arbundles";

if (!globalThis.Buffer) globalThis.Buffer = Buffer;
const { DataItem } = WarpArBundles;

function createDataItemSigner(arweaveWallet) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  const signer = async ({
    data,
    tags,
    target,
    anchor,
    createDataItem = (buf) => new DataItem(buf),
  }) => {
    /**
     * signDataItem interface according to ArweaveWalletConnector
     *
     * https://github.com/jfbeats/ArweaveWalletConnector/blob/7c167f79cd0cf72b6e32e1fe5f988a05eed8f794/src/Arweave.ts#L46C23-L46C23
     */
    const view = await arweaveWallet.signDataItem({
      data,
      tags,
      target,
      anchor,
    });
    const dataItem = createDataItem(Buffer.from(view));
    return {
      id: await dataItem.id,
      raw: await dataItem.getRaw(),
    };
  };

  return signer;
}
```

ethereum key

```js
import { EthereumSigner, createData } from "@dha-team/arbundles";

function createDataItemSigner(wallet) {
  const signer = async ({ data, tags, target, anchor }) => {
    const signer = new EthereumSigner(wallet);
    const dataItem = createData(data, signer, { tags, target, anchor });
    return dataItem.sign(signer).then(async () => ({
      id: await dataItem.id,
      raw: await dataItem.getRaw(),
    }));
  };

  return signer;
}
```

## Summary

Using the signer function developers can control how dataItems are signed without having to share the signing process with aoconnect.

```

## File: guides/aoconnect/spawning-processes.md
```
# Spawning a Process

A deep dive into the concept of Processes can be found in the [ao Processes](../../concepts/processes.md) concept. This guide focuses on using ao connect to spawn a Process.

In order to spawn a Process you must have the TXID of an ao Module that has been uploaded to Arweave. The Module is the source code for the Process. The Process itself is an instantiation of that source.

You must also have the wallet address of a Scheduler Unit (SU). This specified SU will act as the scheduler for this Process. This means that all nodes in the system can tell that they need to read and write to this SU for this Process. You can use the address below.

### Wallet address of an available Scheduler

```lua
_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA
```

In addition, in order to receive messages from other processes an `Authority` tag must be supplied with the wallet address of an authorised Messaging Unit (MU).

### Wallet address of the testnet MU

```lua
fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY
```

## Spawning a Process in NodeJS

```js
import { readFileSync } from "node:fs";

import { createDataItemSigner, spawn } from "@permaweb/aoconnect";

const wallet = JSON.parse(
  readFileSync("/path/to/arweave/wallet.json").toString(),
);

const processId = await spawn({
  // The Arweave TXID of the ao Module
  module: "module TXID",
  // The Arweave wallet address of a Scheduler Unit
  scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
  // A signer function containing your wallet
  signer: createDataItemSigner(wallet),
  /*
    Refer to a Processes' source code or documentation
    for tags that may effect its computation.
  */
  tags: [
    { name: "Authority", value: "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY" },
    { name: "Another-Tag", value: "another-value" },
  ],
});
```

## Spawning a Process in a browser

```js
import { createDataItemSigner, spawn } from "@permaweb/ao-sdk";

const processId = await spawn({
  // The Arweave TXID of the ao Module
  module: "module TXID",
  // The Arweave wallet address of a Scheduler Unit
  scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
  // A signer function containing your wallet
  signer: createDataItemSigner(globalThis.arweaveWallet),
  /*
    Refer to a Processes' source code or documentation
    for tags that may effect its computation.
  */
  tags: [
    { name: "Authority", value: "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY" },
    { name: "Another-Tag", value: "another-value" },
  ],
});
```

```

## File: guides/aos/blueprints/chatroom.md
```
# Chatroom Blueprint

The Chatroom Blueprint is a predesigned template that helps you quickly build a chatroom in `ao`. It is a great way to get started and can be customized to fit your needs.

## Unpacking the Chatroom Blueprint

- **Members**: The `Members` array is used to store the users who have registered to the chatroom.

- **Register Handler**: The `register` handler allows processes to join the chatroom. When a process sends a message with the tag `Action = "Register"`, the handler will add the process to the `Members` array and send a message back to the process confirming the registration.

- **Broadcast Handler**: The `broadcast` handler allows processes to send messages to all the members of the chatroom. When a process sends a message with the tag `Action = "Broadcast"`, the handler will send the message to all the members of the chatroom.

### How To Use:

1. Open your preferred text editor.
2. Open the Terminal.
3. Start your `aos` process.
4. Type in `.load-blueprint chatroom`

### Verify the Blueprint is Loaded:

Type in `Handlers.list` to see the newly loaded handlers.

## What's in the Chatroom Blueprint:

```lua
Members = Members or {}

Handlers.add(
  "register",
  Handlers.utils.hasMatchingTag("Action", "Register"),
  function (msg)
    table.insert(Members, msg.From)
    Handlers.utils.reply("registered")(msg)
  end
)

Handlers.add(
  "broadcast",
  Handlers.utils.hasMatchingTag("Action", "Broadcast"),
  function (msg)
    for _, recipient in ipairs(Members) do
      ao.send({Target = recipient, Data = msg.Data})
    end
    Handlers.utils.reply("Broadcasted.")(msg)
  end
)
```

```

## File: guides/aos/blueprints/cred-utils.md
```
# CRED Utils Blueprint

The CRED Utils Blueprint is a predesigned template that helps you quickly check your CRED balance in `ao` testnet.

## Unpacking the CRED Utils Blueprint

### The `CRED` Metatable

- **CRED.balance**: Evaluating `CRED.balance` will print your process's last known balance of your CRED.
  If you have never fetched your CRED balance before, it will be fetched automatically.
  If you think your CRED has recently changed, consider running `CRED.update` first.

- **CRED.process**: Evaluating `CRED.process` will print the process id of the CRED token issuer.

- **CRED.send**: Invoking `CRED.send(targetProcessId, amount)` like a function will transfer CRED from your `ao` process
  to another `ao` process.

  - `targetProcessId`: **string**: the 43-character process id of the recipient.
  - `amount`: **integer**: The quantity of CRED units to send. 1 CRED === 1000 CRED units.

- **CRED.update**: Evaluating `CRED.update` will fetch your latest CRED balance by sending a message to the CRED
  issuer process. The `UpdateCredBalance` handler (see below) will ingest the response message.

### Handler Definitions

- **Credit Handler**: The `CRED_Credit` handler allows the CRED issuer process (and `aos`) to automatically notify you when your
  CRED balance increase.

- **Debit Handler**: The `CRED_Debit` handler allows the CRED issuer process (and `aos`) to automatically notify you when your
  CRED balance decreases.

- **Update Balance Handler**: The `UpdateCredBalance` handler ingests the response to any `CRED.update` requests.

## How To Use the Blueprint

1. Open the Terminal.
2. Start your `aos` process.
3. Type in `.load-blueprint credUtils`
4. Type in `CRED.balance`

## What's in the CRED Utils Blueprint:

See the `aos` [source code on GitHub](https://github.com/permaweb/aos/blob/main/blueprints/credUtils.lua)
for the blueprint shipped in the latest version of `aos`.

```lua
CRED_PROCESS = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"

_CRED = { balance = "Your CRED balance has not been checked yet. Updating now." }

local credMeta = {
    __index = function(t, key)
        -- sends CRED balance request
        if key == "update" then
            Send({ Target = CRED_PROCESS, Action = "Balance", Tags = { Target = ao.id } })
            return "Balance update requested."
            -- prints local CRED balance, requests it if not set
        elseif key == "balance" then
            if _CRED.balance == "Your CRED balance has not been checked yet. Updating now." then
                Send({ Target = CRED_PROCESS, Action = "Balance", Tags = { Target = ao.id } })
            end
            return _CRED.balance
            -- prints CRED process ID
        elseif key == "process" then
            return CRED_PROCESS
            -- tranfers CRED
        elseif key == "send" then
            return function(target, amount)
                -- ensures amount is string
                amount = tostring(amount)
                print("sending " .. amount .. "CRED to " .. target)
                Send({ Target = CRED_PROCESS, Action = "Transfer", Recipient = target, Quantity = amount })
            end
        else
            return nil
        end
    end
}


CRED = setmetatable({}, credMeta)

-- Function to evaluate if a message is a balance update
local function isCredBalanceMessage(msg)
    if msg.From == CRED_PROCESS and msg.Tags.Balance then
        return true
    else
        return false
    end
end

-- Function to evaluate if a message is a Debit Notice
local function isDebitNotice(msg)
    if msg.From == CRED_PROCESS and msg.Tags.Action == "Debit-Notice" then
        return true
    else
        return false
    end
end

-- Function to evaluate if a message is a Credit Notice
local function isCreditNotice(msg)
    if msg.From == CRED_PROCESS and msg.Tags.Action == "Credit-Notice" then
        return true
    else
        return false
    end
end

local function formatBalance(balance)
    -- Ensure balance is treated as a string
    balance = tostring(balance)
    -- Check if balance length is more than 3 to avoid unnecessary formatting
    if #balance > 3 then
        -- Insert dot before the last three digits
        balance = balance:sub(1, -4) .. "." .. balance:sub(-3)
    end
    return balance
end

-- Handles Balance messages
Handlers.add(
    "UpdateCredBalance",
    isCredBalanceMessage,
    function(msg)
        local balance = nil
        if msg.Tags.Balance then
            balance = msg.Tags.Balance
        end
        -- Format the balance if it's not set
        if balance then
            -- Format the balance by inserting a dot after the first three digits from the right
            local formattedBalance = formatBalance(balance)
            _CRED.balance = formattedBalance
            print("CRED Balance updated: " .. _CRED.balance)
        else
            print("An error occurred while updating CRED balance")
        end
    end
)

-- Handles Debit notices
Handlers.add(
    "CRED_Debit",
    isDebitNotice,
    function(msg)
        print(msg.Data)
    end
)

-- Handles Credit notices
Handlers.add(
    "CRED_Credit",
    isCreditNotice,
    function(msg)
        print(msg.Data)
    end
)
```

```

## File: guides/aos/blueprints/index.md
```
---
prev:
  text: "Build a Token"
  link: "../token"
next:
  text: "Token Blueprint"
  link: "./token"
---

# Blueprints

Blueprints are predesigned templates that help you quickly build in `ao`. They are a great way to get started and can be customized to fit your needs.

## Available Blueprints

- [Chatroom](chatroom)
- [CRED Utils](cred-utils)
- [Staking](staking)
- [Token](token)
- [Voting](voting)

```

## File: guides/aos/blueprints/staking.md
```
# Staking Blueprint

The Staking Blueprint is a predesigned template that helps you quickly build a staking system in `ao`. It is a great way to get started and can be customized to fit your needs.

## Prerequisites

The Staking Blueprint requires the [Token Blueprint](./token.md) to be loaded, first.

## Unpacking the Staking Blueprint

- **Stakers**: The `Stakers` array is used to store the staked tokens of the participants.

- **Unstaking**: The `Unstaking` array is used to store the unstaking requests of the participants.

- **Stake Action Handler**: The `stake` handler allows processes to stake tokens. When a process sends a message with the tag `Action = "Stake"`, the handler will add the staked tokens to the `Stakers` array and send a message back to the process confirming the staking.

- **Unstake Action Handler**: The `unstake` handler allows processes to unstake tokens. When a process sends a message with the tag `Action = "Unstake"`, the handler will add the unstaking request to the `Unstaking` array and send a message back to the process confirming the unstaking.

- **Finalization Handler**: The `finalize` handler allows processes to finalize the staking process. When a process sends a message with the tag `Action = "Finalize"`, the handler will process the unstaking requests and finalize the staking process.

### How To Use:

1. Open your preferred text editor.
2. Open the Terminal.
3. Start your `aos` process.
4. Type in `.load-blueprint staking`

### Verify the Blueprint is Loaded:

Type in `Handlers.list` to see the newly loaded handlers.

## What's in the Staking Blueprint:

```lua
Stakers = Stakers or {}
Unstaking = Unstaking or {}

-- Stake Action Handler
Handlers.stake = function(msg)
  local quantity = tonumber(msg.Tags.Quantity)
  local delay = tonumber(msg.Tags.UnstakeDelay)
  local height = tonumber(msg['Block-Height'])
  assert(Balances[msg.From] and Balances[msg.From] >= quantity, "Insufficient balance to stake")
  Balances[msg.From] = Balances[msg.From] - quantity
  Stakers[msg.From] = Stakers[msg.From] or {}
  Stakers[msg.From].amount = (Stakers[msg.From].amount or 0) + quantity
  Stakers[msg.From].unstake_at = height + delay
end

-- Unstake Action Handler
Handlers.unstake = function(msg)
  local quantity = tonumber(msg.Tags.Quantity)
  local stakerInfo = Stakers[msg.From]
  assert(stakerInfo and stakerInfo.amount >= quantity, "Insufficient staked amount")
  stakerInfo.amount = stakerInfo.amount - quantity
  Unstaking[msg.From] = {
      amount = quantity,
      release_at = stakerInfo.unstake_at
  }
end

-- Finalization Handler
local finalizationHandler = function(msg)
  local currentHeight = tonumber(msg['Block-Height'])
  -- Process unstaking
  for address, unstakeInfo in pairs(Unstaking) do
      if currentHeight >= unstakeInfo.release_at then
          Balances[address] = (Balances[address] or 0) + unstakeInfo.amount
          Unstaking[address] = nil
      end
  end

end

-- wrap function to continue handler flow
local function continue(fn)
  return function (msg)
    local result = fn(msg)
    if (result) == -1 then
      return 1
    end
    return result
  end
end

-- Registering Handlers
Handlers.add("stake",
  continue(Handlers.utils.hasMatchingTag("Action", "Stake")), Handlers.stake)
Handlers.add("unstake",
  continue(Handlers.utils.hasMatchingTag("Action", "Unstake")), Handlers.unstake)
-- Finalization handler should be called for every message
Handlers.add("finalize", function (msg) return -1 end, finalizationHandler)
```

```

## File: guides/aos/blueprints/token.md
```
# Token Blueprint

The Token Blueprint is a predesigned template that helps you quickly build a token in `ao`. It is a great way to get started and can be customized to fit your needs.

## Unpacking the Token Blueprint

- **Balances**: The `Balances` array is used to store the token balances of the participants.

- **Info Handler**: The `info` handler allows processes to retrieve the token parameters, like Name, Ticker, Logo, and Denomination.

- **Balance Handler**: The `balance` handler allows processes to retrieve the token balance of a participant.

- **Balances Handler**: The `balances` handler allows processes to retrieve the token balances of all participants.

- **Transfer Handler**: The `transfer` handler allows processes to send tokens to another participant.

- **Mint Handler**: The `mint` handler allows processes to mint new tokens.

- **Total Supply Handler**: The `totalSupply` handler allows processes to retrieve the total supply of the token.

- **Burn Handler**: The `burn` handler allows processes to burn tokens.

### How To Use:

1. Open your preferred text editor.
2. Open the Terminal.
3. Start your `aos` process.
4. Type in `.load-blueprint token`

### Verify the Blueprint is Loaded:

Type in `Handlers.list` to see the newly loaded handlers.

## What's in the Token Blueprint:

```lua
local bint = require('.bint')(256)
--[[
  This module implements the ao Standard Token Specification.

  Terms:
    Sender: the wallet or Process that sent the Message

  It will first initialize the internal state, and then attach handlers,
    according to the ao Standard Token Spec API:

    - Info(): return the token parameters, like Name, Ticker, Logo, and Denomination

    - Balance(Target?: string): return the token balance of the Target. If Target is not provided, the Sender
        is assumed to be the Target

    - Balances(): return the token balance of all participants

    - Transfer(Target: string, Quantity: number): if the Sender has a sufficient balance, send the specified Quantity
        to the Target. It will also issue a Credit-Notice to the Target and a Debit-Notice to the Sender

    - Mint(Quantity: number): if the Sender matches the Process Owner, then mint the desired Quantity of tokens, adding
        them the Processes' balance
]]
--
local json = require('json')

--[[
  utils helper functions to remove the bint complexity.
]]
--


local utils = {
  add = function(a, b)
    return tostring(bint(a) + bint(b))
  end,
  subtract = function(a, b)
    return tostring(bint(a) - bint(b))
  end,
  toBalanceValue = function(a)
    return tostring(bint(a))
  end,
  toNumber = function(a)
    return bint.tonumber(a)
  end
}


--[[
     Initialize State

     ao.id is equal to the Process.Id
   ]]
--
Variant = "0.0.3"

-- token should be idempotent and not change previous state updates
Denomination = Denomination or 12
Balances = Balances or { [ao.id] = utils.toBalanceValue(10000 * 10 ^ Denomination) }
TotalSupply = TotalSupply or utils.toBalanceValue(10000 * 10 ^ Denomination)
Name = Name or 'Points Coin'
Ticker = Ticker or 'PNTS'
Logo = Logo or 'SBCCXwwecBlDqRLUjb8dYABExTJXLieawf7m2aBJ-KY'

--[[
     Add handlers for each incoming Action defined by the ao Standard Token Specification
   ]]
--

--[[
     Info
   ]]
--
Handlers.add('info', "Info", function(msg)
  msg.reply({
    Name = Name,
    Ticker = Ticker,
    Logo = Logo,
    Denomination = tostring(Denomination)
  })
end)

--[[
     Balance
   ]]
--
Handlers.add('balance', "Balance", function(msg)
  local bal = '0'

  -- If not Recipient is provided, then return the Senders balance
  if (msg.Tags.Recipient) then
    if (Balances[msg.Tags.Recipient]) then
      bal = Balances[msg.Tags.Recipient]
    end
  elseif msg.Tags.Target and Balances[msg.Tags.Target] then
    bal = Balances[msg.Tags.Target]
  elseif Balances[msg.From] then
    bal = Balances[msg.From]
  end

  msg.reply({
    Balance = bal,
    Ticker = Ticker,
    Account = msg.Tags.Recipient or msg.From,
    Data = bal
  })
end)

--[[
     Balances
   ]]
--
Handlers.add('balances', "Balances",
  function(msg) msg.reply({ Data = json.encode(Balances) }) end)

--[[
     Transfer
   ]]
--
Handlers.add('transfer', "Transfer", function(msg)
  assert(type(msg.Recipient) == 'string', 'Recipient is required!')
  assert(type(msg.Quantity) == 'string', 'Quantity is required!')
  assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than 0')

  if not Balances[msg.From] then Balances[msg.From] = "0" end
  if not Balances[msg.Recipient] then Balances[msg.Recipient] = "0" end

  if bint(msg.Quantity) <= bint(Balances[msg.From]) then
    Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
    Balances[msg.Recipient] = utils.add(Balances[msg.Recipient], msg.Quantity)

    --[[
         Only send the notifications to the Sender and Recipient
         if the Cast tag is not set on the Transfer message
       ]]
    --
    if not msg.Cast then
      -- Debit-Notice message template, that is sent to the Sender of the transfer
      local debitNotice = {
        Action = 'Debit-Notice',
        Recipient = msg.Recipient,
        Quantity = msg.Quantity,
        Data = Colors.gray ..
            "You transferred " ..
            Colors.blue .. msg.Quantity .. Colors.gray .. " to " .. Colors.green .. msg.Recipient .. Colors.reset
      }
      -- Credit-Notice message template, that is sent to the Recipient of the transfer
      local creditNotice = {
        Target = msg.Recipient,
        Action = 'Credit-Notice',
        Sender = msg.From,
        Quantity = msg.Quantity,
        Data = Colors.gray ..
            "You received " ..
            Colors.blue .. msg.Quantity .. Colors.gray .. " from " .. Colors.green .. msg.From .. Colors.reset
      }

      -- Add forwarded tags to the credit and debit notice messages
      for tagName, tagValue in pairs(msg) do
        -- Tags beginning with "X-" are forwarded
        if string.sub(tagName, 1, 2) == "X-" then
          debitNotice[tagName] = tagValue
          creditNotice[tagName] = tagValue
        end
      end

      -- Send Debit-Notice and Credit-Notice
      msg.reply(debitNotice)
      Send(creditNotice)
    end
  else
    msg.reply({
      Action = 'Transfer-Error',
      ['Message-Id'] = msg.Id,
      Error = 'Insufficient Balance!'
    })
  end
end)

--[[
    Mint
   ]]
--
Handlers.add('mint', "Mint", function(msg)
  assert(type(msg.Quantity) == 'string', 'Quantity is required!')
  assert(bint(0) < bint(msg.Quantity), 'Quantity must be greater than zero!')

  if not Balances[ao.id] then Balances[ao.id] = "0" end

  if msg.From == ao.id then
    -- Add tokens to the token pool, according to Quantity
    Balances[msg.From] = utils.add(Balances[msg.From], msg.Quantity)
    TotalSupply = utils.add(TotalSupply, msg.Quantity)
    msg.reply({
      Data = Colors.gray .. "Successfully minted " .. Colors.blue .. msg.Quantity .. Colors.reset
    })
  else
    msg.reply({
      Action = 'Mint-Error',
      ['Message-Id'] = msg.Id,
      Error = 'Only the Process Id can mint new ' .. Ticker .. ' tokens!'
    })
  end
end)

--[[
     Total Supply
   ]]
--
Handlers.add('totalSupply', "Total-Supply", function(msg)
  assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')

  msg.reply({
    Action = 'Total-Supply',
    Data = TotalSupply,
    Ticker = Ticker
  })
end)

--[[
 Burn
]] --
Handlers.add('burn', 'Burn', function(msg)
  assert(type(msg.Quantity) == 'string', 'Quantity is required!')
  assert(bint(msg.Quantity) <= bint(Balances[msg.From]), 'Quantity must be less than or equal to the current balance!')

  Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
  TotalSupply = utils.subtract(TotalSupply, msg.Quantity)

  msg.reply({
    Data = Colors.gray .. "Successfully burned " .. Colors.blue .. msg.Quantity .. Colors.reset
  })
end)
```

```

## File: guides/aos/blueprints/voting.md
```
# Voting Blueprint

The Voting Blueprint is a predesigned template that helps you quickly build a voting system in `ao`. It is a great way to get started and can be customized to fit your needs.

## Prerequisites

The Staking Blueprint requires the [Token Blueprint](./token.md) to be loaded, first.

## Unpacking the Voting Blueprint

- **Balances**: The `Balances` array is used to store the token balances of the participants.

- **Votes**: The `Votes` array is used to store the votes of the participants.

- **Vote Action Handler**: The `vote` handler allows processes to vote. When a process sends a message with the tag `Action = "Vote"`, the handler will add the vote to the `Votes` array and send a message back to the process confirming the vote.

- **Finalization Handler**: The `finalize` handler allows processes to finalize the voting process. When a process sends a message with the tag `Action = "Finalize"`, the handler will process the votes and finalize the voting process.

### How To Use:

1. Open your preferred text editor.
2. Open the Terminal.
3. Start your `aos` process.
4. Type in `.load-blueprint voting`

### Verify the Blueprint is Loaded:

Type in `Handlers.list` to see the newly loaded handlers.

## What's in the Voting Blueprint:

```lua
Balances = Balances or {}
Votes = Votes or {}

-- Vote Action Handler
Handlers.vote = function(msg)
  local quantity = Stakers[msg.From].amount
  local target = msg.Tags.Target
  local side = msg.Tags.Side
  local deadline = tonumber(msg['Block-Height']) + tonumber(msg.Tags.Deadline)
  assert(quantity > 0, "No staked tokens to vote")
  Votes[target] = Votes[target] or { yay = 0, nay = 0, deadline = deadline }
  Votes[target][side] = Votes[target][side] + quantity
end

-- Finalization Handler
local finalizationHandler = function(msg)
  local currentHeight = tonumber(msg['Block-Height'])
  -- Process voting
  for target, voteInfo in pairs(Votes) do
      if currentHeight >= voteInfo.deadline then
          if voteInfo.yay > voteInfo.nay then
              print("Handle Vote")
          end
          -- Clear the vote record after processing
          Votes[target] = nil
      end
  end
end

-- wrap function to continue handler flow
local function continue(fn)
  return function (msg)
    local result = fn(msg)
    if (result) == -1 then
      return 1
    end
    return result
  end
end

Handlers.add("vote",
  continue(Handlers.utils.hasMatchingTag("Action", "Vote")), Handlers.vote)
-- Finalization handler should be called for every message
Handlers.add("finalize", function (msg) return -1 end, finalizationHandler)
```

```

## File: guides/aos/cli.md
```
# CLI

There are some command-line arguments you pass to our aos to do the following:

- [name] - create a new process or loads an existing process for your wallet
- --load [file] - load a file, you can add one or many of this command
- --cron [interval] - only used when creating a process
- --wallet [walletfile] - use a specific wallet

## Managing multiple processes with aos

```sh
aos
```

Starts or connects to a process with the name `default`

```sh
aos chatroom
```

Starts or connects to a process with the name of `chatroom`

```sh
aos treasureRoom
```

Starts or connects to a process with the name of `treasureRoom`

## Load flag

```sh
aos treasureRoom --load greeting.lua --load treasure.lua --load puzzle.lua
```

With the load flag I can load many source files to my process

## CRON Flag

If you want to setup your process to react on a schedule we need to tell ao, we do that when we spawn the process.

```sh
aos chatroom --cron 2-minutes
```

## Tag flags

With the tag flags, you can start a process with some custom tags (for e.g. using them as static environment variables):

```sh
aos chatroom --tag-name Chat-Theme --tag-value Dark --tag-name Chat-Name --tag-value Mychat
```

The command above will add the extra tags to the transaction that spawns your process:

```ts
// process data item tags
[
  ...
  { name: "Chat-Theme", value: "Dark" },
  { name: "Chat-Name", value: "Mychat" }
  ...
]
```

```

## File: guides/aos/editor.md
```
# Editor setup

Remembering all the built in ao functions and utilities can sometimes be hard. To enhance your developer experience, it is recommended to install the [Lua Language Server](https://luals.github.io) extension into your favorite text editor and add the [ao addon](https://github.com/martonlederer/ao-definitions). It supports all built in aos [modules](../aos/modules/index) and [globals](../aos/intro#globals).

## VS Code

Install the [sumneko.lua](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension:

1. Search for "Lua" by sumneko in the extension marketplace
2. Download and install the extension
3. Open the VS Code command palette with `Shift + Command + P` (Mac) / `Ctrl + Shift + P` (Windows/Linux) and run the following command:

```
> Lua: Open Addon Manager
```

4. In the Addon Manager, search for "ao", it should be the first result. Click "Enable" and enjoy autocomplete!

## Other editors

1. Verify that your editor supports the [language server protocol](https://microsoft.github.io/language-server-protocol/implementors/tools/)
2. Install Lua Language Server by following the instructions at [luals.github.io](https://luals.github.io/#install)
3. Install the "ao" addon to the language server

## BetterIDEa

[BetterIDEa](https://ide.betteridea.dev) is a custom web based IDE for developing on ao.

It offers a built in Lua language server with ao definitions, so you don't need to install anything. Just open the IDE and start coding!

Features include:

- Code completion
- Cell based notebook ui for rapid development
- Easy process management
- Markdown and Latex cell support
- Share projects with anyone through ao processes
- Tight integration with [ao package manager](https://apm.betteridea.dev)

Read detailed information about the various features and integrations of the ide in the [documentation](https://docs.betteridea.dev).

```

## File: guides/aos/faq.md
```
# FAQ

## Ownership

<details>
  <summary><strong>Understanding Process Ownership</strong></summary>

Start a new process with the aos console, the ownership of the process is set to your wallet address. **aos** uses the **Owner** global variable to define the ownership of the process. If you wish to transfer ownership or lock the process so that no one can own, you simply modify the **Owner** variable to another wallet address or set it to **nil**.

</details>

## JSON

<details>
  <summary><strong>encoding data as json</strong></summary>

When sending data to another process or an external service, you may want to use JSON as a way to encode the data for recipients. Using the json module in lua, you can **encode** and **decode** pure lua tables that contain values.

```lua
Send({Target = Router, Data = require('json').encode({hello = "world"})})
```

</details>

## Send vs ao.send

<details>
  <summary><strong>When to use Send vs ao.send</strong></summary>

Both functions send a message to a process, the difference is ao.send returns the message, in case you want to log it or troubleshoot. The **Send** function is intended to be used in the console for easier access. It is preferred to use **ao.send** in the **handlers**. But they are both interchangeable in **aos**.

</details>

```

## File: guides/aos/inbox-and-handlers.md
```
# Understanding the Inbox

In aos, processes are executed in response to messages via handlers. Unhandled messages are routed to the process's Inbox.

## What are Handlers?

A handler is a function that receives and evaluates messages within your process. It acts upon messages by taking them as parameters.

```lua
function main(Message, ao)
  ...dostuff
  return {
    Output = ...,
    Messages = {},
    Spawns = {}
  }

end
```

And the `main` function returns a lua Table providing `Output, Messages, and Spawns` or an `Error`. With aos you can add functionality to your process by using a Handler. The Handler takes three parameters:

1. Name of the Handler
2. Matcher function
3. Handle function

```lua
Handlers.add("name",
  function (Msg)
    -- Does this message match (return true or false)
    return Msg.Action == "Register"
  end,
  function (Msg)
    print("Registered User.")
    table.insert(Members, Msg.From)
    ao.send({Target = Msg.From, Data = "Registered."})
  end
)
```

## What about Inboxes?

An inbox is a storage area for messages that have not yet been processed. Think of it as a holding zone for incoming, or "inbound," items awaiting handling. Once a message is processed, it's no longer considered "inbound" and thus leaves the inbox.

> Example: Consider the inbox like your voicemail. Just as an unanswered phone call is directed to voicemail for you to address later, messages that your Process doesn't immediately handle are sent to the inbox. This way, unhandled messages are stored until you're ready to process them.

## Summary

Initially, it might seem like all messages are meant to land in your Inbox, which can be puzzling if they disappear after being handled. The analogy of a voicemail should clarify this: much like calls you answer don't go to voicemail, messages you handle won't appear in your Inbox. This illustrates the roles of both the Inbox and Handlers.

```

## File: guides/aos/index.md
```
---
prev:
  text: "Tutorials"
  link: "/guides/tutorials/"
next:
  text: "Introduction to aos"
  link: "/guides/aos/intro"
---

# aos

While `ao` is a hyper parallel computer that enables distributed compute, `aos` is an operating system on top of that computer.

With `aos` you can interact with processes and you can code processes in a very simple and intuitive way. All you need is a terminal and an editor.

The language chosen for `aos` is [lua](../../concepts/lua.md), which is a robust and deterministic dynamic language that is a lot of fun to work with.

If you haven't done so yet, take 15 minutes and go through our [tutorials](../../tutorials/index).

## Diving Deeper into `aos`

- [Introduction to aos](intro)
- [Installing](installing)
- [`aos` CLI](cli)
- [Prompt Customization](prompt)
- [A Ping-Pong Server](pingpong)

## Developer Guides

- [Editor Setup](editor)
- [Troubleshooting with ao.link](troubleshooting)
- [Understanding the Inbox](inbox-and-handlers)
- [Frequently Asked Questions](faq)

### [**Modules**](modules/index)

- [JSON](modules/json)
- [`ao`](modules/ao)
- [crypto](modules/crypto)
- [Base64](modules/base64)
- [Pretty](modules/pretty)
- [Utils](modules/utils)

```

## File: guides/aos/installing.md
```
# Installing aos

Installing aos only requires `NodeJS` - https://nodejs.org

> NOTE: If you are on windows you may get better results with WSL Console.

```sh
npm i -g https://get_ao.g8way.io
```

Once installed you can run by typing `aos`

```

## File: guides/aos/intro.md
```
# Introduction

aos is a different approach to building Processes or Contracts, the ao computer is a decentralized computer network that allows compute to run anywhere and aos in a unique
interactive shell. You can use aos as your personal operating system, your development environment for building ao Processes, and your bot Army.

Lets go over some basic commands.

## Variables

If you want to display the contents of any variable through the console, simply type the variable name.

```lua
Name
```

## Inbox

the `Inbox` is a collection of messages that your Process has received.

```lua
Inbox[1]
```

If you want to get a count of messages, just add the `#` infront of `Inbox`.

```lua
#Inbox
```

The process of checking how many messages are in the inbox is a very common pattern. To make this easier, you can create a function that returns the number of messages within the inbox and displays it in the prompt.

Use either `.editor` or `.load file` to load this function on your process.

```lua
function Prompt()
  return "Inbox: " .. #Inbox .. " > "
end
```

**The Expected Results:**

```lua
undefined
Inbox: 2 >
```

Your prompt now has changed to include the number of messages in your inbox.

## Globals

In aos process there are some Globals that can make development a little more intuitive.

| Name                   | Description                                                                                                                                                                       | Type         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Inbox                  | This is a lua Table that stores all the messages that are received and not handlers by any handlers.                                                                              | Table(Array) |
| Send(Message)          | This is a global function that is available in the interactive environment that allows you to send messages to Processes                                                          | function     |
| Spawn(Module, Message) | This is a global function that is available in the aos interactive environment that allows you to spawn processes                                                                 |
| Name                   | a string that is set on init that describes the name of your process                                                                                                              | string       |
| Owner                  | a string that is set on the init of the process that documents the owner of the process, warning if you change this value, it can brick you ability to interact with your process | string       |
| Handlers               | a lua Table that contains helper functions that allows you to create handlers that execute functionality based on the pattern matching function on inbound messages               | table        |
| Dump                   | a function that takes any lua Table and generates a print friendly output of the data                                                                                             | function     |
| Utils                  | a functional utility library with functions like map, reduce, filter                                                                                                              | module       |
| ao                     | this is a core function library for sending messages and spawing processes                                                                                                        | module       |

## Modules

In aos there are some built in common lua modules that are already available for you to work with, these modules can be referenced with a "require" function.

| Name    | Description                                                                |
| ------- | -------------------------------------------------------------------------- |
| json    | a json module that allows you to encode and decode json documents          |
| ao      | contains ao specific functions like send and spawn                         |
| .base64 | a base64 module that allows you to encode and decode base64 text           |
| .pretty | a pretty print module using the function tprint to output formatted syntax |
| .utils  | an utility function library                                                |

```

## File: guides/aos/load.md
```
# .load

This feature allows you to load lua code from a source file on your local machine, this simple feature gives you a nice DX experience for working with aos processes.

When creating handlers you may have a lot of code and you want to take advantage of a rich development environment like vscode. You can even install the lua extension to get some syntax checking.

So how do you publish your local lua source code to your ao process? This is where the `.load` command comes into play.

hello.lua

```lua
Handlers.add(
  "ping",
  Handlers.utils.hasMatchingData("ping"),
  Handlers.utils.reply("pong")
)
```

aos shell

```lua
.load hello.lua
```

Easy Peasy! 🐶

```

## File: guides/aos/modules/ao.md
```
# ao

Built in global library for sending messages, spawning processes, etc.

### Example usage

The global `ao` object is accessible anywhere in your process:

```lua
-- sends a message to another process ("Transfer" action)
ao.send({
  Target = "usjm4PCxUd5mtaon7zc97-dt-3qf67yPyqgzLnLqk5A",
  Action = "Transfer",
  Recipient = "XjvCPN31XCLPkBo9bUeB7vAK0VC6-eY52-CS-6Iho8F",
  Quantity = tostring(1045)
})
```

## Module variables

- `ao.id`: `{string}` Holds the Arweave ID of your process
- `ao.authorities`: `{table}` An array of optionally trusted callers
- `ao._module`: `{string}` The WASM base module of the process that is executed on each call
- `ao._ref`: `{number}` The counter of the messages sent out in one call instance
- `ao._version`: `{string}` The ao global library version
- `ao.env`: `{table}` The process environment from the initializing message

### `ao.env`

The `ao.env` global variable holds information about the initializing message of the process. It follows the schema below:

```json
{
  "type": "object",
  "properties": {
    "Process": {
      "type": "object",
      "properties": {
        "Id": {
          "type": "string",
          "example": "A1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6Q7R8S9T0"
        },
        "Owner": {
          "type": "string",
          "example": "Xy9PqW3vR5sT8uB1nM6dK0gF2hL4jC7iE9rV3wX5"
        },
        "TagArray": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "example": "App-Name"
              },
              "value": {
                "type": "string",
                "example": "aos"
              }
            }
          },
          "example": [{ "name": "App-Name", "value": "aos" }]
        },
        "Tags": {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "patternProperties": {
            "": {
              "type": "string"
            }
          },
          "example": {
            "App-Name": "aos"
          }
        }
      }
    }
  }
}
```

## Module functions

### `log()`

Appends the provided value/message to the `Results.Output` table which can later be read using the [`aoconnect`](/guides/aoconnect/aoconnect.html) library. Useful for debugging as well as returning an output value to a caller.

- **Parameters:**
  - `txt`: `{any}` The value/message to be appended to the output table
- **Returns:** `{void}`

#### Examples

```lua
...
ao.log("Breakpoint reached")
...
ao.log({
  Message = "Transferred " .. quantity .. " tokens to " .. target,
  Quantity = quantity,
  Recipient = target
})
```

### `send()`

Sends a message to another process by inserting the provided message item into the process' outbox along with the _ao specs compliant_ message tags.

- **Parameters:**
  - `msg`: `{table}` The message to be sent
- **Returns:** The sent message item with the applied tags and `DataItem` fields.

> **Note:** Each field of the `msg` table will be appended as a `DataItem` tag, except the following: `"Target"`, `"Data"`, `"Anchor"`, `"Tags"`. These fields are interpreted as root level `DataItem` fields.

#### Example

```lua
-- sends a message to "XjvCPN31XCLPkBo9bUeB7vAK0VC6-eY52-CS-6Iho8F"
-- with the tag { "name": "Action", "value": "Ping" }
ao.send({
  Target = "XjvCPN31XCLPkBo9bUeB7vAK0VC6-eY52-CS-6Iho8F",
  Action = "Ping"
})
```

### `spawn()`

Allows spawning a new process, from within another process.

- **Parameters:**
  - `module`: `{string}` Arweave transaction ID of the module used by the new process
  - `msg`: `{table}` The message that initializes the process, with the format described [above](#send)
- **Returns:** The initializing message item

#### Example

```lua
ao.spawn("n0BFH80b73mi9VAWUzyuG9gEC3LI2zU2BFxum0N8A9s", {
  ["Custom-Tag"]: "Custom-Value"
})
```

```

## File: guides/aos/modules/base64.md
```
# Base64

A small `base64` module to encode or decode base64 text.

> **Note:** It is recommended to enable caching for large chunks of texts for up to x2 optimization.

### Example usage

```lua
local base64 = require(".base64")

local str = "This will be encoded"

-- is: "VGhpcyB3aWxsIGJlIGVuY29kZWQ="
local encoded = base64.encode(str)

-- is: "This will be encoded"
local decoded = base64.decode(encoded)

assert(decoded == str)
```

## Module functions

### `encode()`

This function encodes the provided string using the default encoder table. The encoder can be customized and a cache is available for larger chunks of data.

- **Parameters:**
  - `str`: `{string}` The string to encode
  - `encoder`: `{table}` Optional custom encoding table
  - `usecache`: `{boolean}` Optional cache for large strings (turned off by default)
- **Returns:** Base64 encoded string

#### Examples

```lua
-- prints: "SGVsbG8gd29ybGQ="
print(base64.encode("Hello world"))

-- customize encoder and allow caching
base64.encode(
  "Hello world",
  base64.makeencoder(nil, "-"),
  true
)
```

### `decode()`

This function decodes the provided base64 encoded string using the default decoder table. The decoder can be customized and a cache is also available here.

- **Parameters:**
  - `str`: `{string}` The base64 encoded string to decode
  - `decoder`: `{table}` Optional custom decoding table
  - `usecache`: `{boolean}` Optional cache for large strings (turned off by default)
- **Returns:** Decoded string

#### Examples

```lua
-- prints: "Hello world"
print(base64.decode("SGVsbG8gd29ybGQ="))

-- customize decoder and allow caching
base64.decode(
  "SGVsbG8gd29ybGQ=",
  base64.makedecoder(nil, "-"),
  true
)
```

### `makeencoder()`

Allows creating a new encoder table to customize the [`encode()`](#encode) function's result.

- **Parameters:**
  - `s62`: `{string}` Optional custom char for 62 (`+` by default)
  - `s63`: `{string}` Optional custom char for 63 (`/` by default)
  - `spad`: `{string}` Optional custom padding char (`=` by default)
- **Returns:** Custom encoder table

#### Examples

```lua
-- create custom encoder
local encoder = base64.makeencoder(nil, nil, "~")

-- prints "SGVsbG8gd29ybGQ~" instead of "SGVsbG8gd29ybGQ="
print(base64.encode("Hello world", encoder))
```

### `makedecoder()`

Allows creating a new decoder table to be able to decode [custom-encoded](#makeencoder) base64 strings.

- **Parameters:**
  - `s62`: `{string}` Optional custom char for 62 (`+` by default)
  - `s63`: `{string}` Optional custom char for 63 (`/` by default)
  - `spad`: `{string}` Optional custom padding char (`=` by default)
- **Returns:** Custom decoder table

#### Examples

```lua
local encoder = base64.makeencoder(nil, nil, "~")
local decoder = base64.makedecoder(nil, nil, "~")

-- "SGVsbG8gd29ybGQ~"
local encoded = base64.encode("Hello world", encoder)

-- prints "Hello world"
print(base64.decode(encoded, decoder))
```

```

## File: guides/aos/modules/crypto.md
```
# crypto

## Overview

The `crypto` module provides a set of cryptographic primitives like digests, ciphers and other cryptographic algorithms in pure Lua. It offers several functionalities to hash, encrypt and decrypt data, simplifying the development of secure communication and data storage. This document will guide you through the module's functionalities, installation, and usage.

## Usage

```lua
local crypto = require(".crypto");
```

## Primitives

1. Digests (sha1, sha2, sha3, keccak, blake2b, etc.)
2. Ciphers (AES, ISSAC, Morus, NORX, etc.)
3. Random Number Generators (ISAAC)
4. MACs (HMAC)
5. KDFs (PBKDF2)
6. Utilities (Array, Stream, Queue, etc.)

---

# Digests

## MD2

Calculates the MD2 digest of a given message.

- **Parameters:**

  - `stream` (Stream): The message in form of stream

- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = crypto.utils.stream.fromString("ao")

return crypto.digest.md2(str).asHex() -- 0d4e80edd07bee6c7965b21b25a9b1ea
```

## MD4

Calculates the MD4 digest of a given message.

- **Parameters:**

  - `stream` (Stream): The message in form of stream

- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = crypto.utils.stream.fromString("ao")

return crypto.digest.md4(str).asHex() -- e068dfe3d8cb95311b58be566db66954
```

## MD5

Calculates the MD5 digest of a given message.

- **Parameters:**

  - `stream` (Stream): The message in form of stream

- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = crypto.utils.stream.fromString("ao")

return crypto.digest.md5(str).asHex() -- adac5e63f80f8629e9573527b25891d3
```

## SHA1

Calculates the SHA1 digest of a given message.

- **Parameters:**

  - `stream` (Stream): The message in form of stream

- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = crypto.utils.stream.fromString("ao")

return crypto.digest.sha1(str).asHex() -- c29dd6c83b67a1d6d3b28588a1f068b68689aa1d
```

## SHA2_256

Calculates the SHA2-256 digest of a given message.

- **Parameters:**
  - `stream` (Stream): The message in form of stream
- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = crypto.utils.stream.fromString("ao")

return crypto.digest.sha2_256(str).asHex() -- ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
```

## SHA2_512

Calculates the SHA2-512 digest of a given message.

- **Parameters:**
  - `msg` (string): The message to calculate the digest
- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = "ao"

return crypto.digest.sha2_512(str).asHex() -- 6f36a696b17ce5a71efa700e8a7e47994f3e134a5e5f387b3e7c2c912abe94f94ee823f9b9dcae59af99e2e34c8b4fb0bd592260c6720ee49e5deaac2065c4b1
```

## SHA3

It contains the following functions:

1. `sha3_256`
2. `sha3_512`
3. `keccak256`
4. `keccak512`

Each function calculates the respective digest of a given message.

- **Parameters:**

  - `msg` (string): The message to calculate the digest

- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua

local str = "ao"

crypto.digest.sha3_256(str).asHex()  -- 1bbe785577db997a394d5b4555eec9159cb51f235aec07514872d2d436c6e985
crypto.digest.sha3_512(str).asHex()  -- 0c29f053400cb1764ce2ec555f598f497e6fcd1d304ce0125faa03bb724f63f213538f41103072ff62ddee701b52c73e621ed4d2254a3e5e9a803d83435b704d
crypto.digest.keccak256(str).asHex() -- 76da52eec05b749b99d6e62bb52333c1569fe75284e6c82f3de12a4618be00d6
crypto.digest.keccak512(str).asHex() -- 046fbfad009a12cef9ff00c2aac361d004347b2991c1fa80fba5582251b8e0be8def0283f45f020d4b04ff03ead9f6e7c43cc3920810c05b33b4873b99affdea

```

## Blake2b

Calculates the Blake2b digest of a given message.

- **Parameters:**

  - `data` (string): The data to be hashed.
  - `outlen` (number): The length of the output hash (optional) **default is 64**.
  - `key` (string): The key to be used for hashing (optional) **default is ""**.

- **Returns:** A table containing functions to get digest in different formats.
  - `asBytes()`: The digest as byte table.
  - `asHex()`: The digest as string in hexadecimal format.
  - `asString()`: The digest as string format.

Example:

```lua
local str = "ao"

crypto.digest.blake2b(str).asHex() -- 576701fd79a126f2c414ef94adf1117c88943700f312679d018c29c378b2c807a3412b4e8d51e191c48fb5f5f54bf1bca29a714dda166797b3baf9ead862ae1d
crypto.digest.blake2b(str, 32).asHex() -- 7050811afc947ba7190bb3c0a7b79b4fba304a0de61d529c8a35bdcbbb5544f4
crypto.digest.blake2b(str, 32, "secret_key").asHex() -- 203c101980fdf6cf24d78879f2e3db86d73d91f7d60960b642022cd6f87408f8
```

---

# Ciphers

## AES

The Advanced Encryption Standard (AES) is a symmetric block cipher used to encrypt sensitive information. It has two functions encrypt and decrypt.

### Encrypt

Encrypts a given message using the AES algorithm.

- **Parameters:**

  - `data` (string): The data to be encrypted.
  - `key` (string): The key to be used for encryption.
  - `iv` (string) optional: The initialization vector to be used for encryption. **default is ""**
  - `mode` (string) optional: The mode of operation to be used for encryption. **default is "CBC"**. Available modes are `CBC`, `ECB`, `CFB`, `OFB`, `CTR`.
  - `keyLength` (number) optional: The length of the key to use for encryption. **default is 128**.

- **Returns:** A table containing functions to get encrypted data in different formats.
  - `asBytes()`: The encrypted data as byte table.
  - `asHex()`: The encrypted data as string in hexadecimal format.
  - `asString()`: The encrypted data as string format.

## Decrypt

Decrypts a given message using the AES algorithm.

- **Parameters:**

  - `cipher` (string): Hex Encoded encrypted data.
  - `key` (string): The key to be used for decryption.
  - `iv` (string) optional: The initialization vector to be used for decryption. **default is ""**
  - `mode` (string) optional: The mode of operation to be used for decryption. **default is "CBC"**. Available modes are `CBC`, `ECB`, `CFB`, `OFB`, `CTR`.
  - `keyLength` (number) optional: The length of the key to use for decryption. **default is 128**.

- **Returns:** A table containing functions to get decrypted data in different formats.
  - `asBytes()`: The decrypted data as byte table.
  - `asHex()`: The decrypted data as string in hexadecimal format.
  - `asString()`: The decrypted data as string format.

Example:

```lua
local str = "ao"

local iv = "super_secret_shh"
local key_128 = "super_secret_shh"

local encrypted = crypto.cipher.aes.encrypt("ao", key, iv).asHex() -- A3B9E6E1FBD9D46930E5F76807C84B8E
local decrypted = crypto.cipher.aes.decrypt(encrypted, key, iv).asHex() -- 616F0000000000000000000000000000

crypto.utils.hex.hexToString(decrypted) -- ao

```

## ISSAC Cipher

ISAAC is a cryptographically secure pseudo-random number generator (CSPRNG) and stream cipher. It has the following functions

1. `seedIsaac`: Seeds the ISAAC cipher with a given seed.
2. `getRandomChar`: Generates a random character using the ISAAC cipher.
3. `random`: Generates a random number between a given range using the ISAAC cipher.
4. `getRandom`: Generates a random number using the ISAAC cipher.
5. `encrypt`: Encrypts a given message using the ISAAC cipher.
6. `decrypt`: Decrypts a given message using the ISAAC cipher.

### Encrypt

Encrypts a given message using the ISAAC cipher.

- **Parameters:**
  - `msg` (string): The message to be encrypted.
  - `key` (string): The key to be used for encryption.
- **Returns:** A table containing functions to get encrypted data in different formats.
  - `asBytes()`: The encrypted data as byte table.
  - `asHex()`: The encrypted data as string in hexadecimal format.
  - `asString()`: The encrypted data as string format.

### Decrypt

Decrypts a given message using the ISAAC cipher.

- **Parameters:**
  - `cipher` (string): Hex Encoded encrypted data.
  - `key` (string): Key to be used for decryption.
- **Returns:** A table containing functions to get decrypted data in different formats.
  - `asBytes()`: The decrypted data as byte table.
  - `asHex()`: The decrypted data as string in hexadecimal format.
  - `asString()`: The decrypted data as string format.

Example:

```lua
local message = "ao";
local key = "secret_key";

local encrypted = crypto.cipher.issac.encrypt(message, key)
local decrypted = crypto.cipher.issac.decrypt(encrypted.asString(), key) -- ao


encrypted.asHex() -- 7851
```

### random

Generates a random number using the ISAAC cipher.

- **Parameters:**
  - `min` (number) optional: The minimum value of the random number. **defaults to 0**.
  - `max` (number) optional: The maximum value of the random number. **defaults to 2^31 - 1**.
  - `seed` (string) optional: The seed to be used for generating the random number. **defaults to math.random(0,2^32 - 1)**.
- **Returns:** A random number between the given range.

Example:

```lua
crypto.cipher.issac.random(0, 100) -- 42
```

## Morus Cipher

MORUS is a high-performance authenticated encryption algorithm submitted to the CAESAR competition, and recently selected as a finalist.

### Encrypt

Encrypts a given message using the MORUS cipher.

- **Parameters:**
  - `key` (string): The encryption key (16 or 32-byte string).
  - `iv` (string): The nonce or initial value (16-byte string).
  - `msg` (string): The message to encrypt (variable length string).
  - `ad` (string) optional: The additional data (variable length string). **defaults to ""**.
- **Returns:** A table containing functions to get encrypted data in different formats.
  - `asBytes()`: The encrypted data as byte table.
  - `asHex()`: The encrypted data as string in hexadecimal format.
  - `asString()`: The encrypted data as string format.

### Decrypt

Decrypts a given message using the MORUS cipher.

- **Parameters:**
  - `key` (string): The encryption key (16 or 32-byte string).
  - `iv` (string): The nonce or initial value (16-byte string).
  - `cipher` (string): The encrypted message (variable length string).
  - `adLen` (number) optional: The length of the additional data (variable length string). **defaults to 0**.
- **Returns:** A table containing functions to get decrypted data in different formats.
  - `asBytes()`: The decrypted data as byte table.
  - `asHex()`: The decrypted data as string in hexadecimal format.
  - `asString()`: The decrypted data as string format.

Example:

```lua
local m = "ao"
local k = "super_secret_shh"
local iv = "0000000000000000"
local ad= ""

local e = crypto.cipher.morus.encrypt(k, iv, m, ad)
local d = crypto.cipher.morus.decrypt(k, iv, e.asString(), #ad) -- ao

e.asHex() -- 514ed31473d8fb0b76c6cbb17af35ed01d0a
```

## NORX Cipher

NORX is an authenticated encryption scheme with associated data that was selected, along with 14 other primitives, for the third phase of the ongoing CAESAR competition. It is based on the sponge construction and relies on a simple permutation that allows efficient and versatile implementations.

### Encrypt

Encrypts a given message using the NORX cipher.

- **Parameters:**
  - `key` (string): The encryption key (32-byte string).
  - `nonce` (string): The nonce or initial value (32-byte string).
  - `plain` (string): The message to encrypt (variable length string).
  - `header` (string) optional: The additional data (variable length string). **defaults to ""**.
  - `trailer` (string) optional: The additional data (variable length string). **defaults to ""**.
- **Returns:** A table containing functions to get encrypted data in different formats.
  - `asBytes()`: The encrypted data as byte table.
  - `asHex()`: The encrypted data as string in hexadecimal format.
  - `asString()`: The encrypted data as string format.

### Decrypt

Decrypts a given message using the NORX cipher.

- **Parameters:**
  - `key` (string): The encryption key (32-byte string).
  - `nonce` (string): The nonce or initial value (32-byte string).
  - `crypted` (string): The encrypted message (variable length string).
  - `header` (string) optional: The additional data (variable length string). **defaults to ""**.
  - `trailer` (string) optional: The additional data (variable length string). **defaults to ""**.
- **Returns:** A table containing functions to get decrypted data in different formats.
  - `asBytes()`: The decrypted data as byte table.
  - `asHex()`: The decrypted data as string in hexadecimal format.
  - `asString()`: The decrypted data as string format.

Example:

```lua
local key = "super_duper_secret_password_shhh"
local nonce = "00000000000000000000000000000000"

local data = "ao"

-- Header and trailer are optional
local header, trailer = data, data

local encrypted = crypto.cipher.norx.encrypt(key, nonce, data, header, trailer).asString()
local decrypted = crypto.cipher.norx.decrypt(key, nonce, encrypted, header, trailer) -- ao

local authTag = encrypted:sub(#encrypted-32+1)

crypto.utils.hex.stringToHex(encrypted) -- 0bb35a06938e6541eccd4440adb7b46118535f60b09b4adf378807a53df19fc4ea28
crypto.utils.hex.stringToHex(authTag) -- 5a06938e6541eccd4440adb7b46118535f60b09b4adf378807a53df19fc4ea28
```

---

# Random Number Generators

The module contains a random number generator using ISAAC which is a cryptographically secure pseudo-random number generator (CSPRNG) and stream cipher.

- **Parameters:**
  - `min` (number) optional: The minimum value of the random number. **defaults to 0**.
  - `max` (number) optional: The maximum value of the random number. **defaults to 2^31 - 1**.
  - `seed` (string) optional: The seed to be used for generating the random number. **defaults to math.random(0,2^32 - 1)**.
- **Returns:** A random number between the given range.

Example:

```lua
crypto.random.(0, 100, "seed") -- 42
```

---

# MACs

## HMAC

The Hash-based Message Authentication Code (HMAC) is a mechanism for message authentication using cryptographic hash functions. HMAC can be used with any iterative cryptographic hash function, e.g., MD5, SHA-1, in combination with a secret shared key.

The modules exposes a function called `createHmac` which is used to create a HMAC instance.

- **Parameters:**
  - `data` (Stream): The data to be hashed.
  - `key` (Array): The key to be used for hashing.
  - `algorithm` (string) optional: The algorithm to be used for hashing. **default is "sha256"**. Available algorithms are "sha1", "sha256". **default is "sha1"**.
- **Returns:** A table containing functions to get HMAC in different formats.
  - `asBytes()`: The HMAC as byte table.
  - `asHex()`: The HMAC as string in hexadecimal format.
  - `asString()`: The HMAC as string format.

Example:

```lua
local data = crypto.utils.stream.fromString("ao")
local key = crypto.utils.array.fromString("super_secret_key")

crypto.mac.createHmac(data, key).asHex() -- 3966f45acb53f7a1a493bae15afecb1a204fa32d
crypto.mac.createHmac(data, key, "sha256").asHex() -- 542da02a324155d688c7689669ff94c6a5f906892aa8eccd7284f210ac66e2a7
```

---

# KDFs

## PBKDF2

The Password-Based Key Derivation Function 2 (PBKDF2) applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.

- **Parameters:**
  - `password` (Array): The password to derive the key from.
  - `salt` (Array): The salt to use.
  - `iterations` (number): The number of iterations to perform.
  - `keyLen` (number): The length of the key to derive.
  - `digest` (string) optional: The digest algorithm to use. **default is "sha1"**. Available algorithms are "sha1", "sha256".
- **Returns:** A table containing functions to get derived key in different formats.
  - `asBytes()`: The derived key as byte table.
  - `asHex()`: The derived key as string in hexadecimal format.
  - `asString()`: The derived key as string format.

Example:

```lua
local salt = crypto.utils.array.fromString("salt")
local password = crypto.utils.array.fromString("password")
local iterations = 4
local keyLen = 16

local res = crypto.kdf.pbkdf2(password, salt, iterations, keyLen).asHex() -- C4C21BF2BBF61541408EC2A49C89B9C6
```

---

# Utilities

## Array

Example Usage:

```lua

local arr = crypto.utils.array

arr.fromString("ao") -- Array
arr.toString(arr.fromString("ao")) -- ao

arr.fromHex("616f") -- Array
arr.toHex(arr.fromHex("616f")) -- 616f

arr.concat(arr.fromString("a"), arr.fromString("o")) -- Array
arr.truncate(arr.fromString("ao"), 1) -- Array

arr.XOR(arr.fromString("a"), arr.fromString("o")) -- Array

arr.substitute(arr.fromString("a"), arr.fromString("o")) -- Array
arr.permute(arr.fromString("a"), arr.fromString("o")) -- Array

arr.copy(arr.fromString("ao")) -- Array
arr.slice(arr.fromString("ao"), 0, 1) -- Array
```

### `size`

Returns the size of the array.

- **Parameters:**
  - `arr` (Array): The array to get the size of.
- **Returns:** The size of the array.

### `fromString`

Creates an array from a string.

- **Parameters:**
  - `str` (string): The string to create the array from.
- **Returns:** The array created from the string.

### `toString`

Converts an array to a string.

- **Parameters:**
  - `arr` (Array): The array to convert to a string.
- **Returns:** The array as a string.

### `fromStream`

Creates an array from a stream.

- **Parameters:**
  - `stream` (Stream): The stream to create the array from.
- **Returns:** The array created from the stream.

### `readFromQueue`

Reads data from a queue and stores it in the array.

- **Parameters:**
  - `queue` (Queue): The queue to read data from.
  - `size` (number): The size of the data to read.
- **Returns:** The array containing the data read from the queue.

### `writeToQueue`

Writes data from the array to a queue.

- **Parameters:**
  - `queue` (Queue): The queue to write data to.
  - `array` (Array): The array to write data from.
- **Returns:** None

### `toStream`

Converts an array to a stream.

- **Parameters:**
  - `arr` (Array): The array to convert to a stream.
- **Returns:** (Stream) The array as a stream.

### `fromHex`

Creates an array from a hexadecimal string.

- **Parameters:**
  - `hex` (string): The hexadecimal string to create the array from.
- **Returns:** The array created from the hexadecimal string.

### `toHex`

Converts an array to a hexadecimal string.

- **Parameters:**
  - `arr` (Array): The array to convert to a hexadecimal string.
- **Returns:** The array as a hexadecimal string.

### `concat`

Concatenates two arrays.

- **Parameters:**
  - `a` (Array): The array to concatenate with.
  - `b` (Array): The array to concatenate.
- **Returns:** The concatenated array.

### `truncate`

Truncates an array to a given length.

- **Parameters:**
  - `a` (Array): The array to truncate.
  - `newSize` (number): The new size of the array.
- **Returns:** The truncated array.

### `XOR`

Performs a bitwise XOR operation on two arrays.

- **Parameters:**
  - `a` (Array): The first array.
  - `b` (Array): The second array.
- **Returns:** The result of the XOR operation.

### `substitute`

Creates a new array with keys of first array and values of second

- **Parameters:**
  - `input` (Array): The array to substitute.
  - `sbox` (Array): The array to substitute with.
- **Returns:** The substituted array.

### `permute`

Creates a new array with keys of second array and values of first array.

- **Parameters:**
  - `input` (Array): The array to permute.
  - `pbox` (Array): The array to permute with.
- **Returns:** The permuted array.

### `copy`

Creates a copy of an array.

- **Parameters:**
  - `input` (Array): The array to copy.
- **Returns:** The copied array.

### `slice`

Creates a slice of an array.

- **Parameters:**
  - `input` (Array): The array to slice.
  - `start` (number): The start index of the slice.
  - `stop` (number): The end index of the slice.
- **Returns:** The sliced array.

---

## Stream

Stream is a data structure that represents a sequence of bytes. It is used to store and manipulate data in a streaming fashion.

Example Usage:

```lua
local stream = crypto.utils.stream

local str = "ao"
local arr = {97, 111}

stream.fromString(str) -- Stream
stream.toString(stream.fromString(str)) -- ao

stream.fromArray(arr) -- Stream
stream.toArray(stream.fromArray(arr)) -- {97, 111}

stream.fromHex("616f") -- Stream
stream.toHex(stream.fromHex("616f")) -- 616f
```

### `fromString`

Creates a stream from a string.

- **Parameters:**
  - `str` (string): The string to create the stream from.
- **Returns:** The stream created from the string.

### `toString`

Converts a stream to a string.

- **Parameters:**
  - `stream` (Stream): The stream to convert to a string.
- **Returns:** The stream as a string.

### `fromArray`

Creates a stream from an array.

- **Parameters:**
  - `arr` (Array): The array to create the stream from.
- **Returns:** The stream created from the array.

### `toArray`

Converts a stream to an array.

- **Parameters:**
  - `stream` (Stream): The stream to convert to an array.
- **Returns:** The stream as an array.

### `fromHex`

Creates a stream from a hexadecimal string.

- **Parameters:**
  - `hex` (string): The hexadecimal string to create the stream from.
- **Returns:** The stream created from the hexadecimal string.

### `toHex`

Converts a stream to a hexadecimal string.

- **Parameters:**
  - `stream` (Stream): The stream to convert to a hexadecimal string.
- **Returns:** The stream as a hexadecimal string.

---

## Hex

Example Usage:

```lua
local hex = crypto.utils.hex

hex.hexToString("616f") -- ao
hex.stringToHex("ao") -- 616f
```

### `hexToString`

Converts a hexadecimal string to a string.

- **Parameters:**
  - `hex` (string): The hexadecimal string to convert to a string.
- **Returns:** The hexadecimal string as a string.

### `stringToHex`

Converts a string to a hexadecimal string.

- **Parameters:**
  - `str` (string): The string to convert to a hexadecimal string.
- **Returns:** The string as a hexadecimal string.

---

## Queue

Queue is a data structure that represents a sequence of elements. It is used to store and manipulate data in a first-in, first-out (FIFO) fashion.

Example Usage:

```lua
local q = crypto.utils.queue()

q.push(1)
q.push(2)
q.pop() -- 1
q.size() -- 1
q.getHead() -- 2
q.getTail() -- 2
q.reset()
```

### `push`

Pushes an element to the queue.

- **Parameters:**
  - `queue` (Queue): The queue to push the element to.
  - `element` (any): The element to push to the queue.
- **Returns:** None

### `pop`

Pops an element from the queue.

- **Parameters:**
  - `queue` (Queue): The queue to pop the element from.
  - `element` (any): The element to pop from the queue.
- **Returns:** The popped element.

### `size`

Returns the size of the queue.

- **Parameters:** None
- **Returns:** The size of the queue.

### `getHead`

Returns the head of the queue.

- **Parameters:** None
- **Returns:** The head of the queue.

### `getTail`

Returns the tail of the queue.

- **Parameters:** None
- **Returns:** The tail of the queue.

### `reset`

Resets the queue.

- **Parameters:** None

---

```

## File: guides/aos/modules/index.md
```
---
prev:
  text: "Staking Blueprint"
  link: "../blueprints/staking"
next:
  text: "JSON"
  link: "./json"
---

# Modules

Documentation on all the built-in modules for aos.

## Available Modules

- [JSON](json)
- [ao](ao)
- [crypto](crypto)
- [Base64](base64)
- [pretty](pretty)
- [Utils](utils)

```

## File: guides/aos/modules/json.md
```
# JSON

The JSON module allows you to encode and decode objects using JavaScript Object Notation.

### Example usage

```lua
local json = require("json")

json.encode({
  a_string = "This is a string",
  nums = { 1, 2, 3 }
})
```

## Module functions

### `encode()`

This function returns a string representation of a Lua object in JSON.

- **Parameters:**
  - `val`: `{any}` The object to format as JSON
- **Returns:** JSON string representation of the provided object

#### Example

```lua
--[[
  prints:
  "[{"name":"John Doe","age":23},{"name":"Bruce Wayne",age:34}]"
]]--
print(json.encode({
  { name = "John Doe", age = 23 },
  { name = "Bruce Wayne", age = 34 }
}))

-- prints "false"
print(json.encode(false))
```

### `decode()`

The function takes a JSON string and turns it into a Lua object.

- **Parameters:**
  - `val`: `{any}` The JSON string to decode
- **Returns:** Lua object corresponding to the JSON string (throws an error for invalid JSON strings)

#### Example

```lua
--[[
  creates the following table:
  { hello = "world" }
]]--
json.decode('{ "hello": "world" }')

-- creates a boolean with true value
json.decode("true")
```

```

## File: guides/aos/modules/pretty.md
```
# Pretty

This module allows printing formatted, human-friendly and readable syntax.

## Module functions

### `tprint()`

Returns a formatted string of the structure of the provided table.

- **Parameters:**
  - `tbl`: `{table}` The table to format
  - `indent`: `{number}` Optional indentation of each level of the table
- **Returns:** Table structure formatted as a string

#### Examples

```lua
local pretty = require(".pretty")

local formatted = pretty.tprint({
  name = "John Doe",
  age = 22,
  friends = { "Maria", "Victor" }
}, 2)

-- prints the formatted table structure
print(formatted)
```

```

## File: guides/aos/modules/utils.md
```
# Utils

A utility library for generic table manipulation and validation. It supports both curry-styled and traditional programming.

> **Note**: It is important to verify that the inputs provided to the following functions match the expected types.

### Example usage

```lua
local utils = require(".utils")

local totalSupply = utils.reduce(
  function (acc, v) return acc + v end,
  0,
  { 2, 4, 9 }
)

print(totalSupply) -- prints 15
```

## Module functions

### `concat()`

This function concatenates array `b` to array `a`.

- **Parameters:**
  - `a`: `{table}` The base array
  - `b`: `{table}` The array to concat to the base array
- **Returns:** An unified array of `a` and `b`

#### Examples

```lua
-- returns { 1, 2, 3, 4, 5, 6 }
concat({ 1, 2, 3 })({ 4, 5, 6 })

-- returns { "hello", "world", "and", "you" }
concat({ "hello", "world" }, { "and", "you" })
```

### `reduce()`

This function executes the provided reducer function for all array elements, finally providing one (unified) result.

- **Parameters:**
  - `fn`: `{function}` The reducer function. It receives the previous result, the current element's value and key in this order
  - `initial`: `{any}` An optional initial value
  - `t`: `{table}` The array to reduce
- **Returns:** A single result from running the reducer across all table elements

#### Examples

```lua
local sum = utils.reduce(
  function (acc, v) return acc + v end,
  0,
  { 1, 2, 3 }
)

print(sum) -- prints 6
```

```lua
local sum = utils
  .reduce(function (acc, v) return acc + v end)(0)({ 5, 4, 3 })

print(sum) -- prints 12
```

### `map()`

This function creates a new array filled with the results of calling the provided map function on each element in the provided array.

- **Parameters:**
  - `fn`: `{function}` The map function. It receives the current array element and key
  - `data`: `{table}` The array to map
- **Returns:** A new array composed of the results of the map function

#### Examples

```lua
-- returns { "Odd", "Even", "Odd" }
utils.map(
  function (val, key)
    return (val % 2 == 0 and "Even") or "Odd"
  end,
  { 3, 4, 7 }
)
```

```lua
-- returns { 4, 8, 12 }
utils.map(function (val, key) return val * 2 end)({ 2, 4, 6 })
```

### `filter()`

This function creates a new array from a portion of the original, only keeping the elements that passed a provided filter function's test.

- **Parameters:**
  - `fn`: `{function}` The filter function. It receives the current array element and should return a boolean, deciding whether the element should be kept (`true`) or filtered out (`false`)
  - `data`: `{table}` The array to filter
- **Returns:** The new filtered array

#### Examples

```lua
-- keeps even numbers
utils.filter(
  function (val) return val % 2 == 0 end,
  { 3, 4, 7 }
)
```

```lua
-- keeps only numbers
utils.filter(
  function (val) return type(val) == "number" end,
  { "hello", "world", 13, 44 }
)
```

### `find()`

This function returns the first element that matches in a provided function.

- **Parameters:**
  - `fn`: `{function}` The find function that receives the current element and returns `true` if it matches, `false` if it doesn't
  - `t`: `{table}` The array to find an element in
- **Returns:** The found element or `nil` if no element matched

#### Examples

```lua
local users = {
  { name = "John", age = 50 },
  { name = "Victor", age = 37 },
  { name = "Maria", age = 33 }
}

-- returns the user "John"
utils.find(
  function (val) return user.name == "John" end,
  users
)
```

```lua
-- returns the user "Maria"
utils.find(function (val) return user.age == 33 end)(users)
```

### `reverse()`

Transforms an array into reverse order.

- **Parameters:**
  - `data`: `{table}` The array to reverse
- **Returns:** The original array in reverse order

#### Example

```lua
-- is: { 3, 2, 1 }
utils.reverse({ 1, 2, 3 })
```

### `includes()`

Determines whether a value is part of an array.

- **Parameters:**
  - `val`: `{any}` The element to check for
  - `t`: `{table}` The array to check in
- **Returns:** A boolean indicating whether or not the provided value is part of the array

#### Examples

```lua
-- this is true
utils.includes("John", { "Victor", "John", "Maria" })
```

```lua
-- this is false
utils.includes(4)({ 3, 5, 7 })
```

### `keys()`

Returns the keys of a table.

- **Parameters:**
  - `table`: `{table}` The table to get the keys for
- **Returns:** An array of keys

#### Example

```lua
-- returns { "hello", "name" }
utils.keys({ hello = "world", name = "John" })
```

### `values()`

Returns the values of a table.

- **Parameters:**
  - `table`: `{table}` The table to get the values for
- **Returns:** An array of values

#### Example

```lua
-- returns { "world", "John" }
utils.values({ hello = "world", name = "John" })
```

### `propEq()`

Checks if a specified property of a table equals with the provided value.

- **Parameters:**
  - `propName`: `{string}` The name of the property to compare
  - `value`: `{any}` The value to compare to
  - `object`: `{table}` The object to select the property from
- **Returns:** A boolean indicating whether the property value equals with the provided value or not

#### Examples

```lua
local user = { name = "John", age = 50 }

-- returns true
utils.propEq("age", 50, user)
```

```lua
local user = { name = "Maria", age = 33 }

-- returns false
utils.propEq("age", 45, user)
```

### `prop()`

Returns the property value that belongs to the property name provided from an object.

- **Parameters:**
  - `propName`: `{string}` The name of the property to get
  - `object`: `{table}` The object to select the property value from
- **Returns:** The property value or `nil` if it was not found

#### Examples

```lua
local user = { name = "Maria", age = 33 }

-- returns "Maria"
utils.prop("name", user)
```

```lua
local user = { name = "John", age = 50 }

-- returns 50
utils.prop("age")(user)
```

### `compose()`

This function allows you to chain multiple array mutations together and execute them in reverse order on the provided array.

- **Parameters:**
  - `...`: `{function[]}` The array mutations
  - `v`: `{table}` The object to execute the provided functions on
- **Returns:** The result from the provided mutations

#### Examples

```lua
-- returns 12
utils.compose(
  utils.reduce(function (acc, val) return acc + val end, 0),
  utils.map(function (val) return val * 2 end)
)({ 1, 2, 3 })
```

```

## File: guides/aos/ownership.md
```

```

## File: guides/aos/pingpong.md
```
<script setup>
  import {onMounted} from "vue"
  import {renderRepl} from "../../tools/replRenderer.jsx"

  const codes = {
    "step-3": `Handlers.add(
      "pingpong",
      Handlers.utils.hasMatchingData("ping"),
      Handlers.utils.reply("pong")
      )`,
    "step-5": `Send({ Target = ao.id, Data = "ping" })`,
    "step-6": `Inbox[#Inbox].Data`
  }

  onMounted(() => {
      Object.keys(codes).forEach((key) => {
        renderRepl(key, codes[key])
      })
    }
  )
</script>

# Creating a Pingpong Process in aos

This tutorial will guide you through creating a simple "ping-pong" process in aos. In this process, whenever it receives a message with the data "ping", it will automatically reply with "pong". This is a basic example of message handling and interaction between processes in aos.

## Step 1: Open the `aos` CLI

- Start by opening your command-line interface and typing `aos` to enter the aos environment.

## Step 2: Access the Editor

- Type `.editor` in the aos CLI to open the inline text editor. This is where you'll write your ping-pong handler code.

## Step 3: Write the Pingpong Handler

- In the editor, enter the following Lua code to add a handler for the pingpong pattern:

  ```lua
  Handlers.add(
    "pingpong",
    Handlers.utils.hasMatchingData("ping"),
    Handlers.utils.reply("pong")
  )
  ```

  <div id="step-3"></div>

- This lua script does three things:
  1. It adds a new handler named "pingpong".
  2. It uses `Handlers.utils.hasMatchingData("ping")` to check if incoming messages contain the data "ping".
  3. If the message contains "ping", `Handlers.utils.reply("pong")` automatically sends back a message with the data "pong".

## Step 4: Exit the Editor

- After writing your code, type `.done` and press Enter to exit the editor and run the script.

## Step 5: Test the Pingpong Process

- To test the process, send a message with the data "ping" to the process. You can do this by typing the following command in the aos CLI:

  ```lua
  Send({ Target = ao.id, Data = "ping" })
  ```

  <div id="step-5"></div>

- The process should respond with a message containing "pong" in the `Inbox`.

## Step 6: Monitor the Inbox

- Check your Inbox to see the "ping" message and your Outbox to confirm the "pong" reply.

```lua
Inbox[#Inbox].Data
```

<div id="step-6"></div>

## Step 7: Experiment and Observe

- Experiment by sending different messages and observe how only the "ping" messages trigger the "pong" response.

## Step 8: Save Your Process (Optional)

- If you want to use this process in the future, save the handler code in a Lua file for easy loading

into aos sessions.

::: info

**ADDITIONAL TIP:**

- **Handler Efficiency**: The simplicity of the handler function is key. Ensure that it's efficient and only triggers under the correct conditions.

:::

## Conclusion

Congratulations! You have now created a basic ping-pong process in aos. This tutorial provides a foundation for understanding message handling and process interaction within the aos environment. As you become more comfortable with these concepts, you can expand to more complex processes and interactions, exploring the full potential of aos.

```

## File: guides/aos/prompt.md
```
# Customizing the Prompt in aos

## Step 1: Open aos and Start the Editor

- Launch the aos command-line interface.
- Enter `.editor` to open the inline text editor.

## Step 2: Write the Custom Prompt Function

- In the editor, define your custom prompt function. For example:
  ```lua
  function Prompt()
      return "YourName@aos> "
  end
  ```
  Customize `"YourName@aos> "` to your preferred prompt text.

## Step 3: Exit and Run Your Code

- To exit the editor and execute your code, type `.done` and then press Enter.
- Your aos prompt should now display the new custom format.

## Step 4: Save for Future Use (Optional)

- If you wish to use this prompt in future aos sessions, save your script in a Lua file.
- In subsequent sessions, load this script to apply your custom prompt.

## Maximizing Your Prompt

There's a great deal of utility and creativity that can come from customizing your prompt. Several things you can do within your prompt are:

- Tracking the number of unhandled messages you have in your inbox by creating a function that shows how many messages you have.

  ```lua
    --Example:
    function Prompt()
      return "YourName Inbox: [" .. #Inbox .. "] > "
    end
  ```

- Tracking the number of members are within your process ID's chatroom.
- Tracking the balance of a specified token that your process ID holds.

## Conclusion

Now that you understand how to maximize the utility within your Prompt, you've now gained a crucial step to streamlining your ao development experience.

```

## File: guides/aos/tables-and-json.md
```

```

## File: guides/aos/token.md
```
# Building a Token in `ao`

When creating tokens, we'll continue to use the [Lua Language](../../references/lua.md) within `ao` to mint a token, guided by the principles outlined in the [Token Specification](../../references/token.md).

### Two Ways to Create Tokens:

**1 - Use the token blueprint:**

`.load-blueprint token`

Using the token blueprint will create a token with all the handlers and state already defined. This is the easiest way to create a token. You'll be able to customize those handlers and state to your after loading the blueprint.

You can learn more about available blueprints here: [Blueprints](../aos/blueprints/index.md)

::: info
Using the token blueprint will definitely get quickly, but you'll still want to understand how to [load and test](token.html#loading-and-testing) the token, so you can customize it to your needs.
:::

**2 - Build from Scratch:**

The following guide will guide you through the process of creating a token from scratch. This is a more advanced way to create a token, but it will give you a better understanding of how tokens work.

## Preparations

### **Step 1: Initializing the Token**

- Open our preferred text editor, preferably from within the same folder you used during the previous tutorial.
- Create a new file named `token.lua`.
- Within `token.lua`, you'll begin by initializing the token's state, defining its balance, name, ticker, and more:

```lua
local json = require('json')

if not Balances then Balances = { [ao.id] = 100000000000000 } end

if Name ~= 'My Coin' then Name = 'My Coin' end

if Ticker ~= 'COIN' then Ticker = 'COIN' end

if Denomination ~= 10 then Denomination = 10 end

if not Logo then Logo = 'optional arweave TXID of logo image' end
```

![token.lua image 1](/token1.png)

Let's break down what we've done here:

- `local json = require('json')`: This first line of this code imports a module for later use.

- `if not Balances then Balances = { [ao.id] = 100000000000000 } end`: This second line is initializing a Balances table which is the way the Process tracks who posses the token. We initialize our token process `ao.id` to start with all the balance.

- The Next 4 Lines, `if Name`, `if Ticker`, `if Denomination`, and `if not Logo` are all optional, except for `if Denomination`, and are used to define the token's name, ticker, denomination, and logo respectively.

::: info
The code `if Denomination ~= 10 then Denomination = 10 end` tells us the number of the token that should be treated as a single unit.
:::

### **Step 2: Info and Balances Handlers**

<br>

#### Incoming Message Handler

Now lets add our first Handler to handle incoming Messages.

```lua
Handlers.add('info', Handlers.utils.hasMatchingTag('Action', 'Info'), function(msg)
  ao.send(
      { Target = msg.From, Tags = { Name = Name, Ticker = Ticker, Logo = Logo, Denomination = tostring(Denomination) } })
end)
```

![Token.lua image 2](/token2.png)

::: info
At this point, you've probably noticed that we're building all of the handlers inside the `token.lua` file rather than using .`editor`.

With many handlers and processes, it's perfectly fine to create your handlers using `.editor`, but because we're creating a full process for initializing a token, setting up info and balances handlers, transfer handlers, and a minting handler, it's best to keep everything in one file.

This also allows us to maintain consistency since each handler will be updated every time we reload the `token.lua` file into `aos`.
:::

This code means that if someone Sends a message with the Tag, Action = "info", our token will Send back a message with all of the information defined above. Note the Target = msg.From, this tells ao we are replying to the process that sent us this message.

#### Info & Token Balance Handlers

Now we can add 2 Handlers which provide information about token Balances.

```lua
Handlers.add('balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), function(msg)
  local bal = '0'

  -- If not Target is provided, then return the Senders balance
  if (msg.Tags.Target and Balances[msg.Tags.Target]) then
    bal = tostring(Balances[msg.Tags.Target])
  elseif Balances[msg.From] then
    bal = tostring(Balances[msg.From])
  end

  ao.send({
    Target = msg.From,
    Tags = { Target = msg.From, Balance = bal, Ticker = Ticker, Data = json.encode(tonumber(bal)) }
  })
end)

Handlers.add('balances', Handlers.utils.hasMatchingTag('Action', 'Balances'),
             function(msg) ao.send({ Target = msg.From, Data = json.encode(Balances) }) end)

```

The first Handler above `Handlers.add('balance'` handles a process or person requesting their own balance or the balance of a Target. Then replies with a message containing the info. The second Handler `Handlers.add('balances'` just replies with the entire Balances table.

### **Step 3: Transfer Handlers**

Before we begin testing we will add 2 more Handlers one which allows for the transfer of tokens between processes or users.

```lua
Handlers.add('transfer', Handlers.utils.hasMatchingTag('Action', 'Transfer'), function(msg)
  assert(type(msg.Tags.Recipient) == 'string', 'Recipient is required!')
  assert(type(msg.Tags.Quantity) == 'string', 'Quantity is required!')

  if not Balances[msg.From] then Balances[msg.From] = 0 end

  if not Balances[msg.Tags.Recipient] then Balances[msg.Tags.Recipient] = 0 end

  local qty = tonumber(msg.Tags.Quantity)
  assert(type(qty) == 'number', 'qty must be number')

  if Balances[msg.From] >= qty then
    Balances[msg.From] = Balances[msg.From] - qty
    Balances[msg.Tags.Recipient] = Balances[msg.Tags.Recipient] + qty

    --[[
      Only Send the notifications to the Sender and Recipient
      if the Cast tag is not set on the Transfer message
    ]] --
    if not msg.Tags.Cast then
      -- Debit-Notice message template, that is sent to the Sender of the transfer
      local debitNotice = {
        Target = msg.From,
        Action = 'Debit-Notice',
        Recipient = msg.Recipient,
        Quantity = tostring(qty),
        Data = Colors.gray ..
            "You transferred " ..
            Colors.blue .. msg.Quantity .. Colors.gray .. " to " .. Colors.green .. msg.Recipient .. Colors.reset
      }
      -- Credit-Notice message template, that is sent to the Recipient of the transfer
      local creditNotice = {
        Target = msg.Recipient,
        Action = 'Credit-Notice',
        Sender = msg.From,
        Quantity = tostring(qty),
        Data = Colors.gray ..
            "You received " ..
            Colors.blue .. msg.Quantity .. Colors.gray .. " from " .. Colors.green .. msg.From .. Colors.reset
      }

      -- Add forwarded tags to the credit and debit notice messages
      for tagName, tagValue in pairs(msg) do
        -- Tags beginning with "X-" are forwarded
        if string.sub(tagName, 1, 2) == "X-" then
          debitNotice[tagName] = tagValue
          creditNotice[tagName] = tagValue
        end
      end

      -- Send Debit-Notice and Credit-Notice
      ao.send(debitNotice)
      ao.send(creditNotice)
    end
  else
    ao.send({
      Target = msg.Tags.From,
      Tags = { Action = 'Transfer-Error', ['Message-Id'] = msg.Id, Error = 'Insufficient Balance!' }
    })
  end
end)
```

In summary, this code checks to make sure the Recipient and Quantity Tags have been provided, initializes the balances of the person sending the message and the Recipient if they dont exist and then attempts to transfer the specified quantity to the Recipient in the Balances table.

```lua
Balances[msg.From] = Balances[msg.From] - qty
Balances[msg.Tags.Recipient] = Balances[msg.Tags.Recipient] + qty
```

If the transfer was successful a Debit-Notice is sent to the sender of the original message and a Credit-Notice is sent to the Recipient.

```lua
-- Send Debit-Notice to the Sender
ao.send({
    Target = msg.From,
    Tags = { Action = 'Debit-Notice', Recipient = msg.Tags.Recipient, Quantity = tostring(qty) }
})
-- Send Credit-Notice to the Recipient
ao.send({
    Target = msg.Tags.Recipient,
    Tags = { Action = 'Credit-Notice', Sender = msg.From, Quantity = tostring(qty) }
})
```

If there was insufficient balance for the transfer it sends back a failure message

```lua
ao.send({
    Target = msg.Tags.From,
    Tags = { Action = 'Transfer-Error', ['Message-Id'] = msg.Id, Error = 'Insufficient Balance!' }
})
```

The line `if not msg.Tags.Cast then` Means were not producing any messages to push if the Cast tag was set. This is part of the ao protocol.

### **Step 4: Mint Handler**

Finally, we will add a Handler to allow the minting of new tokens.

```lua
Handlers.add('mint', Handlers.utils.hasMatchingTag('Action', 'Mint'), function(msg, env)
  assert(type(msg.Tags.Quantity) == 'string', 'Quantity is required!')

  if msg.From == env.Process.Id then
    -- Add tokens to the token pool, according to Quantity
    local qty = tonumber(msg.Tags.Quantity)
    Balances[env.Process.Id] = Balances[env.Process.Id] + qty
  else
    ao.send({
      Target = msg.Tags.From,
      Tags = {
        Action = 'Mint-Error',
        ['Message-Id'] = msg.Id,
        Error = 'Only the Process Owner can mint new ' .. Ticker .. ' tokens!'
      }
    })
  end
end)
```

This code checks to make sure the Quantity Tag has been provided and then adds the specified quantity to the Balances table.

## Loading and Testing

Once you've created your `token.lua` file, or you've used `.load-blueprint token`, you're now ready to begin testing.

#### 1 - Start the aos process

Make sure you've started your aos process by running `aos` in your terminal.

#### 2 - Loading the token.lua file

If you've followed along with the guide, you'll have a `token.lua` file in the same directory as your aos process. From the aos prompt, load in the file.

```lua
.load token.lua
```

#### 3 - Testing the Token

Now we can send Messages to our aos process id, from the same aos prompt to see if is working. If we use ao.id as the Target we are sending a message to ourselves.

```lua
Send({ Target = ao.id, Action = "Info" })
```

This should print the Info defined in the contract. Check the latest inbox message for the response.

```lua
Inbox[#Inbox].Tags
```

This should print the Info defined in the contract.

::: info
Make sure you numerically are checking the last message. To do so, run `#Inbox` first to see the total number of messages are in the inbox. Then, run the last message number to see the data.

**Example:**

If `#Inbox` returns `5`, then run `Inbox[5].Data` to see the data.
:::

#### 4 - Transfer

Now, try to transfer a balance of tokens to another wallet or process id.

::: info
If you need another process id, you can run `aos [name]` in another terminal window to get a new process id. Make sure it's not the same `aos [name]` as the one you're currently using.

**Example:**

If you're using `aos` in one terminal window, you can run `aos test` in another terminal window to get a new process id.
:::

```lua
Send({ Target = ao.id, Tags = { Action = "Transfer", Recipient = 'another wallet or processid', Quantity = '10000' }})
```

After sending, you'll receive a printed message in the terminal similar to `Debit-Notice` on the sender's side and `Credit-Notice` on the recipient's side.

#### 5 - Check the Balances

Now that you've transferred some tokens, let's check the balances.

```lua
Send({ Target = ao.id, Tags = { Action = "Balances" }})
```

```lua
Inbox[#Inbox].Data
```

You will see two process IDs or wallet addresses, each displaying a balance. The first should be your sending process ID, the second should be the recipient's process ID.

#### 6 - Minting Tokens

Finally, attempt to mint some tokens.

```lua
Send({ Target = ao.id, Tags = { Action = "Mint", Quantity = '1000' }})
```

And check the balances again.

```lua
Send({ Target = ao.id, Tags = { Action = "Balances" }})
Inbox[#Inbox].Data
```

You'll then see the balance of the process ID that minted the tokens has increased.

## Conclusion

That concludes the "Build a Token" guide. Learning out to build custom tokens will unlock a great deal of potential for your projects; whether that be creating a new currency, a token for a game, a governance token, or anything else you can imagine.

```

## File: guides/aos/troubleshooting.md
```
# Troubleshooting using ao.link

Working with a decentralized computer and network, you need to be able to troubleshoot more than your own code. You need to be able to track messages, token balances, token transfers of processes. This is where [https://ao.link](https://ao.link) becomes an essential tool in your toolbox.

![ao.link homepage displaying ao network stats](aolink.png)

## Analytics

AOLink has a set of 4 analytic measures:

- Total Messages
- Total Users
- Total Processes
- Total Modules

These analytics give you a quick view into the ao network's total processing health.

## Events

Below, the analytics are the latest events that have appeared on the ao computer. You have a list of messages being scheduled and that have been executed. These events are any of the ao Data Protocol Types. And you can click on the Process ID or the Message ID to get details about each.

![ao.link list of events](aolink-list-example.png)

### Message Details

![ao.link message details displaying the message processed](aolink-message-details.png)

The message details give you key details about:

- From
- To
- Block Height
- Created
- Tags
- Data
- Result Type
- Data

If you want to further troubleshoot and debug, you have the option to look at the result of the CU (Compute Unit) by clicking on "Compute".

![ao.link compute result example for debugging](aolink-compute-example.png)

And further understand linked messages.
![ao.link linked messages](aolink-linked-message-example.png)

### Process Details

![ao.link displaying a process in details](aolink-process-details.png)

The process details provide you with information about the process it's useful to see in the tags with what module this got instantiated from.
If you notice on the left you see the interaction with the process displayed on a graph.
In this case, this is DevChat, and you can see all the processes that have interacted by Registering and Broadcasting Messages.

You can effortless check the Info Handler, by pressing the "Fetch" button.
![ao.link fetching the info handler](aolink-info-handler-example.png)

On the bottom you see the processes balance and all messages send, with the option to break it down into Token transfers and Token balances using the tabs.
![ao.link process message and token info](aolink-message-and-token-example.png)

## Further Questions?

Feel free to reach out on the community Discord of Autonomous Finance, for all questions and support regarding ao.link.
https://discord.gg/4kF9HKZ4Wu

## Summary

AOLink is an excellent tool for tracking events in the ao computer. Give it a try. Also, there is another scanner tool available on the permaweb: https://ao_marton.g8way.io/ - check it out!

```

## File: guides/betteridea/index.md
```
---
prev:
  text: "0rbit"
  link: "../0rbit/index"
next:
  text: "aos"
  link: "../aos/index"
---

# BetterIDEa

[BetterIDEa](https://ide.betteridea.dev) is a custom web based IDE for developing on ao.

It offers a built in Lua language server with ao definitions, so you don't need to install anything. Just open the IDE and start coding!

Features include:

- Code completion
- Cell based notebook ui for rapid development
- Easy process management
- Markdown and Latex cell support
- Share projects with anyone through ao processes
- Tight integration with [ao package manager](https://apm.betteridea.dev)

Read detailed information about the various features and integrations of the ide in the [documentation](https://docs.betteridea.dev).

```

## File: guides/dev-cli/index.md
```
---
prev:
  text: "Guides"
  link: "/guides/index"

next: false
---

# AO Dev-Cli 0.1

The AO dev-cli is a tool that is used to build ao wasm modules, the first versions of the tool only supported lua as the embedded language or c based module. With this release developers now can add any pure c or cpp module to their wasm builds. This opens the door for many different innovations from indexers to languages.

## Install

> [!Warning] Requirements
> Docker is required: https://docker.com

```shell
curl -L https://install_ao.g8way.io | sh
```

## Start a project

```shell
ao init [project-name]
```

## Build a project

```shell
cd [project-name]
ao build
```

## Deploy a project

> [!Warning] Requirements
> You will need an arweave keyfile, you can create a local one using this command `npx -y @permaweb/wallet > wallet.json`

```shell
ao publish -w [path_to_wallet] [path_to_wasm]
```

## Configuration

To customize your build process, create a `config.yml` file in the root directory of your project. This file will modify your settings during the build.

### Configuration Options:

- **`preset`**: Selects default values for `stack_size`, `initial_memory`, and `maximum_memory`. For available presets, see [Config Presets](#config-presets). _(Default: `md`)_

- **`stack_size`**: Specifies the stack size, overriding the value from the preset. Must be a multiple of 64. _(Default: `32MB`)_

- **`initial_memory`**: Defines the initial memory size, overriding the preset value. Must be larger than `stack_size` and a multiple of 64. _(Default: `48MB`)_

- **`maximum_memory`**: Sets the maximum memory size, overriding the preset value. Must be larger than `stack_size` and a multiple of 64. _(Default: `256MB`)_

- **`extra_compile_args`**: Provides additional compilation commands for `emcc`. _(Default: `[]`)_

- **`keep_js`**: By default, the generated `.js` file is deleted since AO Loader uses predefined versions. Set this to `true` if you need to retain the `.js` file. _(Default: `false`)_

## Libraries

Starting with version 0.1.3, you can integrate external libraries into your project. To do this, follow these guidelines:

### Adding Libraries

1. **Create a `libs` Directory**: At the root of your project, create a directory named `/libs`. This is where you'll place your library files.

2. **Place Your Library Files**: Copy or move your compiled library files (e.g., `.a`, `.so`, `.o`, `.dylib`, etc.) into the `/libs` directory.
   > [!NOTE]
   > Ensure that all library files are compiled using `emcc` to ensure compatibility with your project.

> [!IMPORTANT]
> More details to come including an example project...

### Example Directory Structure

```
project-root/
│
├── libs/
│ ├── libexample.a
│ ├── libanother.so
│ └── libmore.o
│
├── process.lua
├── ao.lua
│
└── config.yml
```

### Using Libraries in Your Code

After adding the library files to the `/libs` directory, you need to link against these libraries in your project. This often involves specifying the library path and names in your build scripts or configuration files. For example:

- **For C/C++ Projects**: You can just include any header files placed in the libs folder as the libs with be automatically built into your module.
- **For Lua Projects**: Depending on how your build your libraries and if you compiled them with Lua bindings you can just require the libs in your lua files. `markdown = require('markdown')`

> [!IMPORTANT]
> More details to come...

## Lua Build Example

To create and build a Lua project, follow these steps:

```sh
ao init -l lua [project-name]
cd [project-name]
ao build
```

## C Build Example

To create and build a C project, follow these steps:

```sh
ao init -l c [project-name]
cd [project-name]
ao build
```

## Config Presets

Here are the predefined configuration presets:

```js
'xs': {
    'stack_size': 8388608,        // 8mb
    'initial_memory': 16777216,   // 16mb
    'maximum_memory': 67108864    // 64mb
},
'sm': {
    'stack_size': 16777216,       // 16mb
    'initial_memory': 33554432,   // 32mb
    'maximum_memory': 134217728   // 128mb
},
'md': {
    'stack_size': 33554432,       // 32mb
    'initial_memory': 50331648,   // 48mb
    'maximum_memory': 268435456   // 256mb
},
'lg': {
    'stack_size': 50331648,       // 48mb
    'initial_memory': 67108864,   // 64mb
    'maximum_memory': 268435456   // 256mb
},
'xl': {
    'stack_size': 67108864,       // 64mb
    'initial_memory': 100663296,  // 96mb
    'maximum_memory': 536870912   // 512mb
},
'xxl': {
    'stack_size': 100663296,      // 96mb
    'initial_memory': 134217728,  // 128mb
    'maximum_memory': 4294967296  // 4096mb
},
```

```

## File: guides/index.md
```
---
prev:
  text: "Expanding the Arena"
  link: "/tutorials/bots-and-games/build-game"
next:
  text: "aos"
  link: "./aos/index"
---

# Guides

These guides are designed to help you navigate ao and aos, and to help you build everything from chatrooms to autonomous, decentralized bots, and more.

## Full Courses

- [AOS: Compute on AO](aos/index)
- [Connect: Javascript/library](aoconnect/aoconnect)

## Snacks

- [CLI: AO Module Builder](dev-cli/index)
- [Using WeaveDrive](snacks/weavedrive)
- [Using Sqlite](snacks/sqlite)

## Additional

- [Community](/community/index)
- [Release Notes](/releasenotes/index)

```

## File: guides/snacks/sqlite.md
```
---
prev:
  text: "Guides"
  link: "/guides/index"

next: false
---

# Getting started with Sqlite

Sqlite is a relational database engine. In this guide, we will show how you can spawn a process with sqlite and work with data using a relational database.

## Setup

> NOTE: make sure you have aos installed, if not checkout [Getting Started](/welcome/getting-started)

spawn a new process `mydb` with a `--sqlite` flag, this instructs ao to use the latest sqlite module.

```sh
aos mydb --sqlite
```

## Install AO Package Manager

installing apm, the ao package manager we can add helper modules to make it easier to work with sqlite.

```lua
.load-blueprint apm
```

## Install dbAdmin package

DbAdmin is a module that connects to a sqlite database and provides functions to work with sqlite.

https://apm_betteridea.g8way.io/pkg?id=@rakis/DbAdmin

```lua
apm.install('@rakis/dbAdmin')
```

## Create sqlite Database

```lua
local sqlite = require('lsqlite3')
Db = sqlite.open_memory()
dbAdmin = require('@rakis/DbAdmin').new(Db)
```

## Create Table

Create a table called Comments

```lua
dbAdmin:exec([[
  CREATE TABLE IF NOT EXISTS Comments (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Asset TEXT,
    User TEXT,
    Body TEXT
  );
]])
```

## Insert data

```lua
local SQL = "INSERT INTO Comments (Asset, User, Body) VALUES (?,?,?);"
dbAdmin:apply(SQL, {"dog.jpg", "Anon", "Nice Picture"})
```

## List data

```lua
local SQL = "SELECT * FROM Comments;"
dbAdmin:exec(SQL)
```

## Congrats!

You are using sqlite on AO 🎉

```

## File: guides/snacks/weavedrive.md
```
---
prev:
  text: "Guides"
  link: "/guides/index"

next: false
---

# Using WeaveDrive

WeaveDrive has been released on AO Testnet, which is great! But how to use it with your process? This post aims to provide a step by step guide on how to use WeaveDrive in your AOS process.

The current availability time is called `Assignments` and this type puts WeaveDrive in a mode that allows you to define an Attestor wallet address when you create your AOS process. This will enable the process to load data from dataItems that have a Attestation created by this wallet.

## Prep Tutorial

In order, to setup the tutorial for success we need to upload some data and upload an attestation. It will take a few minutes to get mined into a block on arweave.

Install `arx`

```sh
npm i -g @permaweb/arx
```

Create a wallet

```
npx -y @permaweb/wallet > ~/.test-wallet.json
```

Create some data

```
mkdir test-weavedrive
cd test-weavedrive
echo "<h1>Hello WeaveDrive</h1>" > data.html
arx upload data.html -w ~/.test-wallet.json -t arweave
```

You should get a result like:

```
Loaded address: vfSWG3girEwCBggs9xeztuRyiltsT2CJH_m-S8A58yQ
Uploaded to https://arweave.net/9TIPJD2a4-IleOQJzRwPnDHO5DA891MWAyIdJJ1SiSk
```

Create Attestation

> It is important to copy the id of the uploaded dataItem, in the above case `9TIPJD2a4-IleOQJzRwPnDHO5DA891MWAyIdJJ1SiSk` as your Message Value.

```
echo "attestation-example" > att.txt
arx upload att.txt -w ~/.test-wallet.json -t arweave --tags Data-Protocol ao Type Attestation Message 9TIPJD2a4-IleOQJzRwPnDHO5DA891MWAyIdJJ1SiSk
```

:clap: Awesome! That will take a few minutes to get mined on arweave, once it is mined then we will be able to read the data.html dataItem using WeaveDrive

## Enable WeaveDrive in a process

Lets create a new AOS process with WeaveDrive enabled and the wallet we created above as an Attestor.

> NOTE: it is important to use the same wallet address that was used to sign the attestation data-item.

```
aos test-weavedrive --tag-name Extension --tag-value WeaveDrive --tag-name Attestor --tag-value vfSWG3girEwCBggs9xeztuRyiltsT2CJH_m-S8A58yQ --tag-name Availability-Type --tag-value Assignments
```

> NOTE: It does take a few minutes for the data to get 20 plus confirmations which is the threshold for data existing on arweave. You may want to go grab a coffee. :coffee:

## Install apm and WeaveDrive

```
.load-blueprint apm
apm.install('@rakis/WeaveDrive')
```

## Load Data

```
Drive = require('@rakis/WeaveDrive')
Drive.getData("9TIPJD2a4-IleOQJzRwPnDHO5DA891MWAyIdJJ1SiSk")
```

```

## File: index.md
```
---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: ""
  text: "The hyper parallel computer."
  tagline: "Decentralized compute at any scale. Only possible on Arweave."
  actions:
    - theme: brand
      text: Let's Go!
      link: /welcome/index

features:
  - title: Tutorials
    details: Follow the step-by-step tutorials to start building on ao.
    link: /tutorials/index

  - title: Guides
    details: Bite size walkthroughs on specific features.
    link: /guides/index

  - title: Concepts
    details: Learn how the ao network works under the hood.
    link: /concepts/index
---

## More Information

- [Community Guides and Links](/community/index)
- [Release Notes](/releasenotes/index)

```

## File: references/ao.md
```
# ao Module

version: 0.0.3

`ao` process communication is handled by messages, each process receives messages in the form of ANS-104 DataItems, and needs to be able to do the following common operations.

- isTrusted(msg) - check to see if this message trusted?
- send(msg) - send message to another process
- spawn(module, msg) - spawn a process

The goal of this library is to provide this core functionality in the box of the `ao` developer toolkit. As a developer you have the option to leverage this library or not, but it integrated by default.

## Properties

| Name        | Description                                                                                                  | Type   |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| id          | Process Identifier (TXID)                                                                                    | string |
| \_module    | Module Identifier (TXID)                                                                                     | string |
| authorities | Set of Trusted TXs                                                                                           | string |
| Authority   | Identifiers that the process is able to accept transactions from that are not the owner or the process (0-n) | string |
| \_version   | The version of the library                                                                                   | string |
| env         | Evaluation Environment                                                                                       | string |
| outbox      | Holds Messages and Spawns for response                                                                       | object |

## Methods

### send(msg: Message\<table>) : Message\<table>

The send function takes a Message object or partial message object, it adds additional `ao` specific tags to the object and returns a full Message object, as well as insert into the ao.outbox.Messages table.

**parameters**

- msg

Schema

```json
{
    "type": "object",
    "properties": {
        "Target": {
            "type": "string",
            "description": "Process/Wallet to send message to"
        },
        "Data": {
            "type": "any",
            "description": "data to send in message DataItem"
        },
        "Tags": {
            "type": "object or array<name,value>"
            "description": "This property can be an array of name,value objects or an object"
        }
    }
}
```

Example 1

```lua
local message = ao.send({
    Target = msg.From,
    Data = "ping",
    Tags = {
        {
            name = "Content-Type",
            value = "text/plain"
        }
    }
})
```

Example 2

```lua
local message = ao.send({
    Target = msg.From,
    Data = "ping",
    Tags = {
        "Content-Type" = "text/plain"
    }
})
```

**returns**

Schema

```json
{
    "type": "object",
    "properties": {
        "Target": {
            "type": "string"
        },
        "Data": {
            "type": "any"
        },
        "Tags": {
            "type": "array"
            "description": "name/value array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "value":{"type":"string"}
                }
            }
        }
    }
}
```

### spawn(module : string, spawn : Spawn\<table>) : Spawn\<table>

The `spawn` function takes a module TXID as the first argument and a full or partial Spawn table. The result will return a full Spawn table. The spawn function will also generate a `Ref_` tag with a unique reference identifier.

**parameters**

| Name   | Description                                                                             | Type   |
| ------ | --------------------------------------------------------------------------------------- | ------ |
| module | The TXID that identifies the module binary to use to instantiate the process with        | string |
| spawn  | The `spawn` full or partial table object that contains the `Data` and `Tags` properties | table  |

Schema

module

```json
{
  "type": "string"
}
```

spawn

```json
{
  "type": "object",
  "properties": {
    "Data": { "type": "any" },
    "Tags": {
      "type": "object or array",
      "description": "can be either <name,value> array, or object"
    }
  }
}
```

**returns**

Schema

```json
{
  "type": "object",
  "properties": {
    "Data": { "type": "any" },
    "Tags": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "value": { "type": "string" }
        }
      }
    }
  }
}
```

### isTrusted(msg : Message\<table>) : boolean

When spawning a process, 0 or more Authority Tags can be supplied, the ao library adds each of these values to a table array on the `ao` properties called `authorities`. This set provides the `Proof of Authority` feature for ao.TN.1. When a message arrives in the `handle` function, the developer can call `ao.isTrusted` to verify if the message is from a trusted source.

**parameters**

| Name | Description                                 | Type  |
| ---- | ------------------------------------------- | ----- |
| msg  | Message to check if trusted by this process | table |

Schema

```json
{
    "type": "object",
    "properties": {
        "Target": {
            "type": "string"
        },
        "Data": {
            "type": "any"
        },
        "Tags": {
            "type": "array"
            "description": "name/value array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "value":{"type":"string"}
                }
            }
        }
    }
}
```

```

## File: references/community.md
```
---
prev:
  text: "ao Editor Setup"
  link: "/references/editor-setup.md"
---

# Community

[Autonomous Finance](https://www.autonomous.finance/)

- Autonomous Finance is a dedicated research and technology entity, focusing on the intricacies of financial infrastructure within the ao network.

[BetterIdea](https://betteridea.dev/)

- Build faster, smarter, and more efficiently with BetterIDEa, the ultimate native web IDE for AO development

[Orbit](https://www.0rbit.co/)

- 0rbit provides any data from the web to an ao process
  by utilizing the power of ao, and 0rbit nodes.
  The user sends a message to the 0rbit ao, 0rbit nodes fetches the data and the user process receives the data.

```

## File: references/cron.md
```
# Cron Messages

ao has the ability to generate messages on a specified interval, this interval could be seconds, minutes, hours, or blocks. These messages automatically get evaluated by a monitoring process to inform the Process to evaluate these messages over time. The result is a real-time Process that can communicate with the full ao network or oracles in the outside network.

## Setting up cron in a process

The easiest way to create these cron messages is by spawning a new process in the aos console and defining the time interval.

```sh
aos [myProcess] --cron 5-minutes
```

When spawning a new process, you can pass a cron argument in your command-line followed by the interval you would like the cron to tick. If you want the messages to trigger in real-time you must initiate a monitor event. In aos, you simply call `.monitor` and it will kick off a worker process on the `mu` that triggers the cron messages from the `cu`. Then your Process will receive the cron messages every `x-interval`.

```lua
.monitor
```

If you wish to stop triggering the cron messages simply call `.unmonitor` and this will stop the triggering process, but the next time you send a message, the generated cron messages will still get created and processed.

## Handling cron messages

Every cron message has an `Action` tag with the value `Cron`. [Handlers](handlers.md) can be defined to perform specific tasks autonomously, each time a cron message is received.

```lua
Handlers.add(
  "CronTick", -- handler name
  Handlers.utils.hasMatchingTag("Action", "Cron"), -- handler pattern to identify cron message
  function () -- handler task to execute on cron message
    -- do something
  end
)
```

Cron messages are a powerful utility that can be used to create "autonomous agents" with expansive capabilities.

```

## File: references/data.md
```
# Accessing Data from Arweave with ao

There may be times in your ao development workflow that you want to access data from arweave. With ao your process can send an assignment instructing the network to provide that data to your Process.

In order, to request data from arweave, you simply call Assign with a list of processes you would like to assign the data to, and a Message which is the txid of a Message.

```lua

Assign({
  Processes = { ao.id },
  Message = 'message-id'
})

```

You can also call Send with a table of process ids in the Assignments parameter. This will tell the network to generate the Message and then assign it to all the process ids in the Assignments list.

```lua
Send({
  Target = ao.id,
  Data = 'Hello World',
  Assignments = { 'process-id-1', 'process-id-2' }
})
```

## Why data from Arweave?

Your Process may need to access data from a message to make a decision about something, or you may want to add features to your Process via the `data` load feature. Or you may want to access a Message from a process without replicating the entire message.

```

## File: references/editor-setup.md
```
---
next:
  text: "Community"
  link: "/references/community"
---

# Editor setup

Remembering all the built in ao functions and utilities can sometimes be hard. To enhance your developer experience, it is recommended to install the [Lua Language Server](https://luals.github.io) extension into your favorite text editor and add the [ao addon](https://github.com/martonlederer/ao-definitions). It supports all built in aos [modules](../guides/aos/modules/index.md) and [globals](../guides/aos/intro.md#globals).

## VS Code

Install the [sumneko.lua](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension:

1. Search for "Lua" by sumneko in the extension marketplace
2. Download and install the extension
3. Open the VS Code command palette with `Shift + Command + P` (Mac) / `Ctrl + Shift + P` (Windows/Linux) and run the following command:

```
> Lua: Open Addon Manager
```

4. In the Addon Manager, search for "ao", it should be the first result. Click "Enable" and enjoy autocomplete!

## Other editors

1. Verify that your editor supports the [language server protocol](https://microsoft.github.io/language-server-protocol/implementors/tools/)
2. Install Lua Language Server by following the instructions at [luals.github.io](https://luals.github.io/#install)
3. Install the "ao" addon to the language server

## BetterIDEa

[BetterIDEa](https://ide.betteridea.dev) is a custom web based IDE for developing on ao.

It offers a built in Lua language server with ao definitions, so you don't need to install anything. Just open the IDE and start coding!

Features include:

- Code completion
- Cell based notebook ui for rapid development
- Easy process management
- Markdown and Latex cell support
- Share projects with anyone through ao processes
- Tight integration with [ao package manager](https://apm.betteridea.dev)

Read detailed information about the various features and integrations of the ide in the [documentation](https://docs.betteridea.dev).

```

## File: references/eval.md
```
# Eval 

Each AO process includes an onboard `Eval` handler that evaluates any new code it receives. This handler enables the process to determine the appropriate action for the incoming code and verifies if the message originates from the process owner.

The `Eval` handler can also be manually triggered to evaluate received Data from an incoming message.

## Sending an Eval Message in NodeJS
```js
import { readFileSync } from "node:fs";
import { message, createDataItemSigner } from "@permaweb/aoconnect";

const wallet = JSON.parse(
  readFileSync("/path/to/arweave/wallet.json").toString()
);

await message({
  // The arweave TXID of the process, this will become the "target".
  process: "process-id", // Replace with the actual process ID

  // Tagging the Eval Action so the receiving process evaluates and adds the new Handler from the Data field.
  tags: [
    { name: "Action", value: "Eval" },
    { name: "Data", value: 'Handlers.add("ping", Handlers.utils.reply("pong"))' },
  ],

  // A signer function used to build the message "signature"
  signer: createDataItemSigner(wallet),

})
  .then(console.log)
  .catch(console.error);
```

## Sending an Eval Message in a Browser
```js
import { message, createDataItemSigner } from "@permaweb/aoconnect";

await message({
  // The arweave TXID of the process, this will become the "target".
  process: "process-id", // Replace with the actual process ID

  // Tagging the Eval Action so the receiving process evaluates and adds the new Handler from the Data field.
  tags: [
    { name: "Action", value: "Eval" },
    { name: "Data", value: 'Handlers.add("ping", Handlers.utils.reply("pong"))' },
  ],

  // A signer function used to build the message "signature"
  signer: createDataItemSigner(globalThis.arweaveWallet),

})
  .then(console.log)
  .catch(console.error);
```

```

## File: references/handlers.md
```
# Handlers (Version 0.0.5)

## Overview

The Handlers library provides a flexible way to manage and execute a series of process functions based on pattern matching. An AO process responds based on receiving Messages, these messages are defined using the Arweave DataItem specification which consists of Tags, and Data. Using the Handlers library, you can define a pipeline of process evaluation based on the attributes of the AO Message. Each handler items consists of a pattern function, a handle function, and a name. This library is suitable for scenarios where different actions need to be taken based on varying input criteria.

## Concepts

### Pattern Matching Tables

Pattern Matching Tables is a concept of providing a Table representation of the matching shape of the incoming message. Here are the rules:

```lua

{ "Action" = "Do-Something" } -- Match any message via a table of tags it must contain

{ "Recipient" = '_' } -- Match messages that have a recipient tag with any value..

{ "Quantity" = "%d+" } -- Validate a tag against a Lua string match (similar to regular expressions)

{ "Quantity" = function(v) return tonumber(v) ~= Nil end } -- Apply a function to the tag to check it. Nil or false do not match
```

Example:

if you want to match on every message with the Action equal to "Balance"

```lua
{ Action = "Balance" }
```

if you want to match on every message with the Quantity being a Number

```lua
{ Quantity = "%d+" }
```

### Resolvers

Resolvers are tables in which each key is a pattern matching table and the value is a function that is executed based on the matching key. This allows developers to create case like statements in the resolver property.

```lua
Handlers.add("foobarbaz",
  { Action = "Update" }, {
  [{ Status = "foo" }] = function (msg) print("foo") end,
  [{ Status = "bar" }] = function (msg) print("bar") end,
  [{ Status = "baz" }] = function (msg) print("baz") end
})
```

## Module Structure

- `Handlers._version`: String representing the version of the Handlers library.
- `Handlers.list`: Table storing the list of registered handlers.

## Handler method common function signature

| Parameter          | Type                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name               | string                       | The identifier of the handler item in the handlers list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| pattern            | Table or Function            | This parameter can take a table that specifies a pattern that the message MUST match, for example `{ Action = "Balance", Recipient = "_" }` this table describes a message that has a Tag called action and it equals the string "Balance", and the message MUST have a Recipient Tag with a value. If you are unable to add a pattern via a table, you can also use the `function` which receives the message DataItem as its argument and you can return a `true`, `false` or `"continue"` result. The `true` result tells the Handlers evaluation pipeline to invoke this handler and exit out of the pipeline. The `false` result tells the Handlers evaluation pipeline to skip this handler and try to find a pattern matched by the next Handler item in the pipeline. Finally, the `"continue"` informs the Handlers evaluation to invoke this handler and continue evaluating. |
| handler            | Table (Resolver) or Function | This parameter can take a table that acts as a conditional that invokes a function based on a pattern matched key. or a Function that takes the message DataItem as an argument and performs some business logic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| maxRuns (optional) | number                       | As of 0.0.5, each handler function takes an optional function to define the amount of times the handler should match before it is removed. The default is infinity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## Functions

### `Handlers.add(name, pattern, handler)`

adds a new handler or updates an existing handler by name

### `Handlers.append(name, pattern, handle)`

Appends a new handler to the end of the handlers list.

### `Handlers.once(name, pattern, handler)`

Only runs once when the pattern is matched.

### `Handlers.prepend(name, pattern, handle)`

Prepends a new handler to the beginning of the handlers list.

### `Handlers.before(handleName)`

Returns an object that allows adding a new handler before a specified handler.

### `Handlers.after(handleName)`

Returns an object that allows adding a new handler after a specified handler.

### `Handlers.remove(name)`

Removes a handler from the handlers list by name.

## Examples

### Using pattern Table

```lua
Handlers.add("ping",
  { Action = "ping" },
  function (msg)
    print('ping')
    msg.reply({Data = "pong" })
  end
)
```

### Using resolvers

```lua
Handlers.add(
  "foobarbaz",
  { Action = "Speak" }, {
  [{Status = "foo"}] = function (msg) print("foo") end,
  [{Status = "bar"}] = function (msg) print("bar") end,
  [{Status = "baz"}] = function (msg) print("baz") end
})
```

### Using functions

```lua
Handlers.add("example",
  function (msg)
    return msg.Action == "Speak"
  end,
  function (msg)
    print(msg.Status)
  end
)
```

## Notes

- Handlers are executed in the order they appear in `handlers.list`.
- The pattern function should return false to skip the handler, true to break after the handler is executed, or `"continue"` to execute handler and continue with the next handler.

## Handlers.utils

The Handlers.utils module provides two functions that are common matching patterns and one function that is a common handle function.

- hasMatchingData(data)
- hasMatchingTag(name, value)
- reply(txt)

### Handlers.utils.hasMatchingData(data : string)

This helper returns a function that requires a message argument, so you can drop this into the pattern argument of any handler. The function compares the data on the incoming message with the string provided as an argument.

```lua
Handlers.add("ping",
    Handlers.utils.hasMatchingData("ping"),
    ...
)
```

If a message comes into the process with data set to ping, this handler will match on it and invoke the handle function.

### Handlers.hasMatchingTag(name : string, value : string)

This helper returns a function that requires a message argument, so you can drop this into any pattern argument on the Handlers module. The function compares the Tag Name and Value, if they are equal then it invokes the handle function.

```lua
Handlers.add("ping",
    Handlers.utils.hasMatchingData("ping"),
    ...
)
```

### Handlers.reply(text : string)

This helper is a simple handle function, it basically places the text value in to the Data property of the outbound message.

```lua
Handlers.add("ping",
    Handlers.utils.hasMatchingData("ping"),
    Handlers.utils.reply("pong")
)
```

```

## File: references/index.md
```
---
prev:
  text: "The aos interface"
  link: "/concepts/tour"
next:
  text: "Lua"
  link: "./lua"
---

# References

## Index

- [Lua](lua)

```

## File: references/lua.md
```
# Meet Lua

### Understanding Lua

- **Background**: Lua is a lightweight, high-level, multi-paradigm programming language designed primarily for embedded systems and clients. It's known for its efficiency, simplicity, and flexibility.
- **Key Features**: Lua offers powerful data description constructs, dynamic typing, efficient memory management, and good support for object-oriented programming.

### Setting Up

1. **Installation**: Visit [Lua's official website](http://www.lua.org/download.html) to download and install Lua.
2. **Environment**: You can use a simple text editor and command line, or an IDE like ZeroBrane Studio or Eclipse with a Lua plugin.

### Basic Syntax and Concepts (in aOS)

- **Hello World**:
  ```lua
  "Hello, World!"
  ```
- **Variables and Types**: Lua is dynamically typed. Basic types include `nil`, `boolean`, `number`, `string`, `function`, `userdata`, `thread`, and `table`.
- **Control Structures**: Includes `if`, `while`, `repeat...until`, and `for`.
- **Functions**: First-class citizens in Lua, supporting closures and higher-order functions.
- **Tables**: The only data structuring mechanism in Lua, which can be used to represent arrays, sets, records, etc.

### Hands-On Practice

- **Experiment with Lua's Interactive Mode**: Run `aos` in your terminal and start experimenting with Lua commands.
- **Write Simple Scripts**: Create `.lua` files and run them using the Lua interpreter. Use `.load file.lua` feature to upload lua code on your `aos` process.

### Resources

- **Official Documentation**: [Lua 5.3 Reference Manual](https://www.lua.org/manual/5.3/)
- **Online Tutorials**: Websites like [Learn Lua](https://www.learn-lua.org/) are great for interactive learning.
- **Books**: "Programming in Lua" (first edition available [online](http://www.lua.org/pil/contents.html)) is a comprehensive resource.
- **Community**: Join forums or communities like [Lua Users](http://lua-users.org/) for support and discussions.

### Best Practices

- **Keep It Simple**: Lua is designed to be simple and flexible. Embrace this philosophy in your code.
- **Performance**: Learn about Lua's garbage collection and efficient use of tables.
- **Integration**: Consider how Lua can be embedded into other applications, particularly C/C++ projects.

### Conclusion

Lua is a powerful language, especially in the context of embedded systems and game development. Its simplicity and efficiency make it a great choice for specific use cases. Enjoy your journey into Lua programming!

```

## File: references/token.md
```
# ao Token and Subledger Specification

**Status:** DRAFT-1
**Targeting Network:** ao.TN.1

This specification describes the necessary message handlers and functionality required for a standard ao token process. Implementations of this standard typically offer users the ability to control a transferrable asset, whose scarcity is maintained by the process.

Each compliant process will likely implement a ledger of balances in order to encode ownership of the asset that the process represents. Compliant processes have a set of methods that allow for the modification of this ledger, typically with safe-guards to ensure the scarcity of ownership of the token represented by the process.

Additionally, this specification describes a 'subledger' process type which, when implemented, offers the ability to split move a number of the tokens from the parent into a child process that implements the same token interface specification. If the `From-Module` of the subledger process is trusted by the participants, these subledgers can be used to transact in the 'source' token, without directly exchanging messages with it. This allows participants to use the tokens from a process, even if that process is congested. Optionally, if the participants trust the `Module` a subledger process is running, they are able to treat balances across these processes as _fungible_. The result of this is that an arbitrary numbers of parallel processes -- and thus, transactions -- can be processed by a single token at any one time.

# Token Processes

A specification-compliant token process responds to a number of different forms of messages, with each form specified in an `Action` tag. The full set of `Action` messages that the token must support are as follows:

| Name     | Description                                                                                            | Read-Only          |
| -------- | ------------------------------------------------------------------------------------------------------ | ------------------ |
| Balance  | get the balance of an identifier                                                                        | :heavy_check_mark: |
| Balances | get a list of all ledger/account balances                                                              | :heavy_check_mark: |
| Transfer | send 1 or more units from the callers balance to one or move targets with the option to notify targets | :x:                |
| Mint     | if the ledger process is the root and you would like to increase token supply                          | :x:                |

In the remainder of this section the tags necessary to spawn a compliant token process, along with the form of each of the `Action` messages and their results is described.

## Spawning Parameters

Every compliant token process must carry the following immutable parameters upon its spawning message:

| Tag          | Description                                                                                                           | Optional?          |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Name         | The title of the token, as it should be displayed to users.                                                           | :heavy_check_mark: |
| Ticker       | A suggested shortened name for the token, such that it can be referenced quickly.                                     | :heavy_check_mark: |
| Logo         | An image that applications may desire to show next to the token, in order to make it quickly visually identifiable. | :heavy_check_mark: |
| Denomination | The number of the token that should be treated as a single unit when quantities and balances are displayed to users.  | :x:                |

## Messaging Protocol

### Balance(Target? : string)

Returns the balance of a target, if a target is not supplied then the balance of the sender of the message must be returned.

Example `Action` message:

```lua=
send({
    Target = "{TokenProcess Identifier}",
    Tags = {
        Action = "Balance",
        Target = "{IDENTIFIER}"
    }
})
```

Example response message:

```
{
    Tags = {
        Balance = "50",
        Target = "LcldyO8wwiGDzC3iXzGofdO8JdR4S1_2A6Qtz-o33-0",
        Ticker = "FUN"
    }
}
```

### Balances()

Returns the balance of all participants in the token.

```lua
send({
    Target = "[TokenProcess Identifier]",
    Tags = {
        Action = "Balances",
        Limit = 1000, # TODO: Is this necessary if the user is paying for the compute and response?
        Cursor? = "BalanceIdentifier"
    }
})
```

Example response message:

```lua
{
    Data = {
        "MV8B3MAKTsUOqyCzQ0Tsa2AR3TiWTBU1Dx0xM4MO-f4": 100,
        "LcldyO8wwiGDzC3iXzGofdO8JdR4S1_2A6Qtz-o33-0": 50
    }
}
```

### Transfer(Target, Quantity)

If the sender has a sufficient balance, send the `Quantity` to the `Target`, issuing a `Credit-Notice` to the recipient and a `Debit-Notice` to the sender. The `Credit-` and `Debit-Notice` should forward any and all tags from the original `Transfer` message with the `X-` prefix. If the sender has an insufficient balance, fail and notify the sender.

```lua
send({
    Target = "[TokenProcess Identifier]",
    Tags = {
        { name = "Action", value = "Transfer" },
        { name = "Recipient", value = "[ADDRESS]" },
        { name = "Quantity", value = "100" },
        { name = "X-[Forwarded Tag(s) Name]", value= "[VALUE]" }
    }
})
```

If a successful transfer occurs a notification message should be sent if `Cast` is not set.

```lua
ao.send({
    Target = "[Recipient Address]",
    Tags = {
        { name = "Action", value = "Credit-Notice" },
        { name = "Sender", value = "[ADDRESS]" },
        { name = "Quantity", value = "100"},
        { name = "X-[Forwarded Tag(s) Name]", value= "[VALUE]" }
    }
})
```

Recipients will infer from the `From-Process` tag of the message which tokens they have received.

### Get-Info()

```lua
send({
    Target = "{Token}",
    Tags = {
        Action = "Info"
    }
})
```

### Mint() [optional]

Implementing a `Mint` action gives the process a way of allowing valid participants to create new tokens.

```lua
send({
    Target ="{Token Process}",
    Tags = {
        Action = "Mint",
        Quantity = "1000"
    }
})
```

# Subledger Processes

In order to function appropriately, subledgers must implement the full messaging protocol of token contracts (excluding the `Mint` action). Subledgers must also implement additional features and spawn parameters for their processes. These modifications are described in the following section.

### Spawning Parameters

Every compliant subledger process must carry the following immutable parameters upon its spawning message:

| Tag          | Description                                                        | Optional? |
| ------------ | ------------------------------------------------------------------ | --------- |
| Source-Token | The `ID` of the top-most process that this subledger represents.   | :x:       |
| Parent-Token | The `ID` of the parent process that this subledger is attached to. | :x:       |

### `Credit-Notice` Handler

Upon receipt of a `Credit-Notice` message, a compliant subledger process must check if the process in question is the `Parent-Token`. If it is, the subledger must increase the balance of the `Sender` by the specified quantity.

### Transfer(Target, Quantity)

In addition to the normal tags that are passed in the `Credit-Notice` message to the recipient of tokens, a compliant subledger process must also provide both of the `Source-Token` and `Parent-Token` values. This allows the recipient of the `Transfer` message -- if they trust the `Module` of the subledger process -- to credit a receipt that is analogous (fungible with) deposits from the `Source-Token`.

The modified `Credit-Notice` should be structured as follows:

```lua
ao.send({
    Target = "[Recipient Address]",
    Tags = {
        { name = "Action", value = "Credit-Notice" },
        { name = "Quantity", value = "100"},
        { name = "Source-Token", value = "[ADDRESS]" },
        { name = "Parent-Token", value = "[ADDRESS]" },
        { name = "X-[Forwarded Tag(s) Name]", value= "[VALUE]" }
    }
})
```

### Withdraw(Target?, Quantity)

All subledgers must allow balance holders to withdraw their tokens to the parent ledger. Upon receipt of an `Action: Withdraw` message, the subledger must send an `Action` message to its `Parent-Ledger`, transferring the requested tokens to the caller's address, while debiting their account locally. This transfer will result in a `Credit-Notice` from the `Parent-Ledger` for the caller.

```lua
send({
    Target = "[TokenProcess Identifier]",
    Tags = {
     { name = "Action", value = "Withdraw" },
     { name = "Recipient", value = "[ADDRESS]" },
     { name = "Quantity", value = "100" }
    }
})
```

# Token Example

> NOTE: When implementing a token it is important to remember that all Tags on a message MUST be "string"s. Using the`tostring` function you can convert simple types to strings.

```lua
if not balances then
  balances = { [ao.id] = 100000000000000 }
end

if name ~= "Fun Coin" then
  name = "Fun Coin"
end

if ticker ~= "Fun" then
  ticker = "fun"
end

if denomination ~= 6 then
  denomination = 6
end

-- handlers that handler incoming msg
handlers.add(
  "transfer",
  handlers.utils.hasMatchingTag("Action", "Transfer"),
  function (msg)
    assert(type(msg.Tags.Recipient) == 'string', 'Recipient is required!')
    assert(type(msg.Tags.Quantity) == 'string', 'Quantity is required!')

    if not balances[msg.From] then
      balances[msg.From] = 0
    end

    if not balances[msg.Tags.Recipient] then
      balances[msg.Tags.Recipient] = 0
    end

    local qty = tonumber(msg.Tags.Quantity)
    assert(type(qty) == 'number', 'qty must be number')
    -- handlers.utils.reply("Transferring qty")(msg)
    if balances[msg.From] >= qty then
      balances[msg.From] = balances[msg.From] - qty
      balances[msg.Tags.Recipient] = balances[msg.Tags.Recipient] + qty
      ao.send({
        Target = msg.From,
        Tags = {
          Action = "Debit-Notice",
          Quantity = tostring(qty)
        }
      })
      ao.send({
      Target = msg.Tags.Recipient,
      Tags = {
        Action = "Credit-Notice",
        Quantity = tostring(qty)
      }})
      -- if msg.Tags.Cast and msg.Tags.Cast == "true" then
      --   return
      -- end

    end
  end
)

handlers.add(
  "balance",
  handlers.utils.hasMatchingTag("Action", "Balance"),
  function (msg)
    assert(type(msg.Tags.Target) == "string", "Target Tag is required!")
    local bal = "0"
    if balances[msg.Tags.Target] then
      bal = tostring(balances[msg.Tags.Target])
    end
    ao.send({Target = msg.From, Tags = {
      Target = msg.From,
      Balance = bal,
      Ticker = ticker or ""
    }})
  end
)

local json = require("json")

handlers.add(
  "balances",
  handlers.utils.hasMatchingTag("Action", "Balances"),
  function (msg)
    ao.send({
      Target = msg.From,
      Data = json.encode(balances)
    })
  end

)

handlers.add(
  "info",
  handlers.utils.hasMatchingTag("Action", "Info"),
  function (msg)
    ao.send({Target = msg.From, Tags = {
      Name = name,
      Ticker = ticker,
      Denomination = tostring(denomination)
    }})
  end
)
```

```

## File: references/wasm.md
```
# Meet Web Assembly

WebAssembly (often abbreviated as Wasm) is a modern binary instruction format providing a portable compilation target for high-level languages like C, C++, and Rust. It enables deployment on the web for client and server applications, offering a high level of performance and efficiency. WebAssembly is designed to maintain the security and sandboxing features of web browsers, making it a suitable choice for web-based applications. It's a key technology for web developers, allowing them to write code in multiple languages and compile it into bytecode that runs in the browser at near-native speed.

The significance of WebAssembly lies in its ability to bridge the gap between web and native applications. It allows complex applications and games, previously limited to desktop environments, to run in the browser with comparable performance. This opens up new possibilities for web development, including the creation of high-performance web apps, games, and even the porting of existing desktop applications to the web. WebAssembly operates alongside JavaScript, complementing it by enabling performance-critical components to be written in languages better suited for such tasks, thereby enhancing the capabilities and performance of web applications.

```

## File: releasenotes/aos-2_0_0.md
```
# AOS Release Notes v2.0.1

## Install

```sh
npm install -g https://get_ao.arweave.net
```

## Features

- Bootloader
- Handlers.once (defaults to prepend mode)
- WeaveDrive with Attestors
- WeaveDrive L2 Headers
- Spawn module by name
- Graphql Modules
- msg.reply patch

### Bootloader

Bootloader enables users to include a script to evaluate when spawning a process. You can include this script either with the `Data` property or with a `txId` specified on the `On-Boot` Tag.

#### Examples

via AOS Console using `data`

```shell
echo "print('Hello Bootloader')" > example.lua
aos ex1 --tag-name On-Boot --tag-value Data --data example.lua
```

> As AOS boots up, you should see Hello Bootloader!

```
AOS Client Version: 2.0.1. 2024
Type "Ctrl-C" twice to exit

Your AOS process:  uJvxYDk6Q1JvocgfajNbEcKmqoCDWEksjG6EH1o9xRo

Hello Bootloader
```

via Spawn message using `data`

```lua
Spawn(ao.env.Module.Id, {
    ["On-Boot"] = "Data",
    Data = [[ print("Hello World!") ]]
})
```

via AOS Console using `txId`

```shell
aos ex2 --tag-name On-Boot --tag-value 1VAPs_V6iVx-zxuMW7Ns0IrYqqk6LAEDAe1b-EqKP28
```

via Spawn message using `txId`

```lua
Spawn(ao.env.Module.Id, {
  ["On-Boot"] = "1VAPs_V6iVx-zxuMW7Ns0IrYqqk6LAEDAe1b-EqKP28"
})
```

### Hanlders.once (defaults to prepend mode)

Now, when Handlers.once is called, it will default to prepend to the top of the Handlers stack.

```lua
Handlers.once("Name", function (msg)
  -- do something
end)

-- is the same as

Handlers.prepend("Name", "Name", function (msg)
  -- do something
end, 1)

```

### WeaveDrive with Attestors

Using WeaveDrive to access dataitems from Arweave with Attestations. When you spawn a process you can provide one or more `Attestor` tags with arweave wallet addresses as value. Then the arweave wallets set as attestors can create `Attestation` dataItems that authorize access to a specific arweave dataitem using weavedrive.

Here is a short guide on how to use WeaveDrive with Attestors - https://hackmd.io/@ao-docs/r1bixxO-Je

### WeaveDrive L2 Headers

Now, weaveDrive users can get L2 dataItem headers using `drive.getDataItem(id)` from the WeaveDrive apm module. This features allows indexers to index L2 dataItems and processes like stamps2 to determine if a user is stamping an Atomic Asset. The result is more interoperability with Arweave.

```lua
.load-blueprint apm
apm.install('@rakis/WeaveDrive')
local drive = require('@rakis/WeaveDrive')
local metaData = drive.getDataItem('K1jD3xrCJV3UnRtnBuQdd7k8HCwh9TX9GS-kh_Oevvw')
```

### Spawn module by name

Spawn module by name or identifier:

```sh
aos gql --module aos-graphql-sqlite-sm
```

Create a graphql/sqlite process by using the module name.

### Graphql Modules

You can now build graphql processes using the graphql custom module:

https://github.com/TillaTheHun0/aos-graphq

### msg reply legacy patch

This release provides a blueprint optional patch to allow for old processes to leverage the `msg.reply` function.

`.load-blueprint patch-legacy-reply`

A blueprint that creates a passthrough handler to attach `.reply` function to the `msg` table, for handlers downstream to leverage.

This allows developers to take advantage of the `.receive` function in AOS 2.0 and interact with older AOS 0.x processes. With this patch AOS 0.x processes need to be able to reply with an `X-Reference` tag. So that the `.receive` co-routine can properly catch the response sent by the calling AOS 2.0 process.

Then open an older process:

```sh
aos [my aos process]
```

And run `.load-blueprint patch-legacy-reply`

```
.load-blueprint patch-legacy-reply
```

## Source

You can review the blueprint source here:

https://github.com/permaweb/aos/blob/main/blueprints/patch-legacy-reply.lua

```lua
local function patchReply(msg)
  if not msg.reply then
    msg.reply = function (replyMsg)
      replyMsg.Target = msg["Reply-To"] or (replyMsg.Target or msg.From)
      replyMsg["X-Reference"] = msg["X-Reference"] or msg.Reference or ""
      replyMsg["X-Origin"] = msg["X-Origin"] or ""

      return ao.send(replyMsg)
    end
  end
end

Handlers.prepend("_patch_reply", function (msg) return "continue" end, patchReply)

```

---

Fixes:

- bubble up errors during co-routine resume functions - https://github.com/permaweb/aos/pull/374
- update token.lua to check for .reply before using the replay method
- staking blueprint improvement to default unstake delay block wait, and prepend finalize handler.
- fixed bug with Handlers.remove - https://github.com/permaweb/aos/pull/366

```

## File: releasenotes/aos-2_0_1.md
```
# AOS Release Notes v2.0.1

## Install

```sh
npm install -g https://get_ao.arweave.net
```

## Features

- Bootloader
- Handlers.once (defaults to prepend mode)
- WeaveDrive with Attestors
- WeaveDrive L2 Headers
- Spawn module by name
- Graphql Modules
- msg.reply patch

### Bootloader

Bootloader enables users to include a script to evaluate when spawning a process. You can include this script either with the `Data` property or with a `txId` specified on the `On-Boot` Tag.

#### Examples

via AOS Console using `data`

```shell
echo "print('Hello Bootloader')" > example.lua
aos ex1 --tag-name On-Boot --tag-value Data --data example.lua
```

> As AOS boots up, you should see Hello Bootloader!

```
AOS Client Version: 2.0.1. 2024
Type "Ctrl-C" twice to exit

Your AOS process:  uJvxYDk6Q1JvocgfajNbEcKmqoCDWEksjG6EH1o9xRo

Hello Bootloader
```

via Spawn message using `data`

```lua
Spawn(ao.env.Module.Id, {
    ["On-Boot"] = "Data",
    Data = [[ print("Hello World!") ]]
})
```

via AOS Console using `txId`

```shell
aos ex2 --tag-name On-Boot --tag-value 1VAPs_V6iVx-zxuMW7Ns0IrYqqk6LAEDAe1b-EqKP28
```

via Spawn message using `txId`

```lua
Spawn(ao.env.Module.Id, {
  ["On-Boot"] = "1VAPs_V6iVx-zxuMW7Ns0IrYqqk6LAEDAe1b-EqKP28"
})
```

### Hanlders.once (defaults to prepend mode)

Now, when Handlers.once is called, it will default to prepend to the top of the Handlers stack.

```lua
Handlers.once("Name", function (msg)
  -- do something
end)

-- is the same as

Handlers.prepend("Name", "Name", function (msg)
  -- do something
end, 1)

```

### WeaveDrive with Attestors

Using WeaveDrive to access dataitems from Arweave with Attestations. When you spawn a process you can provide one or more `Attestor` tags with arweave wallet addresses as value. Then the arweave wallets set as attestors can create `Attestation` dataItems that authorize access to a specific arweave dataitem using weavedrive.

Here is a short guide on how to use WeaveDrive with Attestors - https://hackmd.io/@ao-docs/r1bixxO-Je

### WeaveDrive L2 Headers

Now, weaveDrive users can get L2 dataItem headers using `drive.getDataItem(id)` from the WeaveDrive apm module. This features allows indexers to index L2 dataItems and processes like stamps2 to determine if a user is stamping an Atomic Asset. The result is more interoperability with Arweave.

```lua
.load-blueprint apm
apm.install('@rakis/WeaveDrive')
local drive = require('@rakis/WeaveDrive')
local metaData = drive.getDataItem('K1jD3xrCJV3UnRtnBuQdd7k8HCwh9TX9GS-kh_Oevvw')
```

### Spawn module by name

Spawn module by name or identifier:

```sh
aos gql --module aos-graphql-sqlite-sm
```

Create a graphql/sqlite process by using the module name.

### Graphql Modules

You can now build graphql processes using the graphql custom module:

https://github.com/TillaTheHun0/aos-graphql

### msg reply legacy patch

This release provides a blueprint optional patch to allow for old processes to leverage the `msg.reply` function.

`.load-blueprint patch-legacy-reply`

A blueprint that creates a passthrough handler to attach `.reply` function to the `msg` table, for handlers downstream to leverage.

This allows developers to take advantage of the `.receive` function in AOS 2.0 and interact with older AOS 0.x processes. With this patch AOS 0.x processes need to be able to reply with an `X-Reference` tag. So that the `.receive` co-routine can properly catch the response sent by the calling AOS 2.0 process.

Then open an older process:

```sh
aos [my aos process]
```

And run `.load-blueprint patch-legacy-reply`

```
.load-blueprint patch-legacy-reply
```

## Source

You can review the blueprint source here:

https://github.com/permaweb/aos/blob/main/blueprints/patch-legacy-reply.lua

```lua
-- patch reply
local function patchReply(msg)
  if not msg.reply then
    msg.reply = function (replyMsg)
      replyMsg.Target = msg["Reply-To"] or (replyMsg.Target or msg.From)
      replyMsg["X-Reference"] = msg["X-Reference"] or msg.Reference or ""
      replyMsg["X-Origin"] = msg["X-Origin"] or ""

      return ao.send(replyMsg)
    end
  end
end

Handlers.prepend("_patch_reply", function (msg) return "continue" end, patchReply)

```

---

Fixes:

- bubble up errors during co-routine resume functions - https://github.com/permaweb/aos/pull/374
- update token.lua to check for .reply before using the replay method
- staking blueprint improvement to default unstake delay block wait, and prepend finalize handler.
- fixed bug with Handlers.remove - https://github.com/permaweb/aos/pull/366

```

## File: releasenotes/index.md
```
---
next:
  text: "Getting Started"
  link: "./getting-started"
---

# Release Notes

- [AOS 2.0.1](aos-2_0_1)
- [AOS 2.0.0](aos-2_0_0)

```

## File: tutorials/begin/chatroom.md
```
# Building a Chatroom in aos

::: info
If you've found yourself wanting to learn how to create a chatroom within `ao`, then that means we understand at least the basic methodology of sending and receiving messages. If not, it's suggested that you review the [Messaging](messaging) tutorial before proceeding.
:::

In this tutorial, we'll be building a chatroom within `ao` using the Lua scripting language. The chatroom will feature two primary functions:

1. **Register**: Allows processes to join the chatroom.
2. **Broadcast**: Sends messages from one process to all registered participants.

Let's begin by setting up the foundation for our chatroom.

## Video Tutorial

<iframe width="680" height="350" src="https://www.youtube.com/embed/oPCx-cfubF0?si=D5yWxmyFMV-4mh2P" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Step 1: The Foundation

- Open your preferred code editor, e.g. VS Code.

::: info
You may find it helpful to have the [Recommended Extensions](../../references/editor-setup.md) installed in your code editor to enhance your Lua scripting experience.
:::

- Create a new file named `chatroom.lua`.

![Chatroom Lua File](/chatroom1.png)

## Step 2: Creating The Member List

- In `chatroom.lua`, you'll begin by initializing a list to track participants:

  ```lua
  Members = Members or {}
  ```

  ![Chatroom Lua File - Naming the Member List](/chatroom2.png)

  - Save the `chatroom.lua` file

## Step 3: Load the Chatroom into aos

With `chatroom.lua` saved, you'll now load the chatroom into `aos`.

- If you haven't already, start your `aos` in your terminal inside the directory where chatroom.lua is saved
- In the `aos` CLI, type the following script to incorporate your script into the `aos` process:

  ```lua
  .load chatroom.lua
  ```

  ![Loading the Chatroom into aos](/chatroom3.png)

  As the screenshot above shows, you may receive `undefined` as a response. This is expected, but we still want to make sure the file loaded correctly.

  ::: info
  In the Lua Eval environment of aos, when you execute a piece of code that doesn't explicitly return a value, `undefined` is a standard response, indicating that no result was returned. This can be observed when loading resources or executing operations. For instance, executing `X = 1` will yield `undefined` because the statement does not include a return statement.

  However, if you execute `X = 1; return X`, the environment will return the value `1`. This behavior is essential to understand when working within this framework, as it helps clarify the distinction between executing commands that modify state versus those intended to produce a direct output.
  :::

- Type `Members`, or whatever you named your user list, in `aos`. It should return an empty array `{ }`.

  ![Checking the Members List](/chatroom4.png)

  If you see an empty array, then your script has been successfully loaded into `aos`.

## Step 4: Creating Chatroom Functionalities

### The Registration Handler

The register handler will allow processes to join the chatroom.

1. **Adding a Register Handler:** Modify `chatroom.lua` to include a handler for `Members` to register to the chatroom with the following code:

   ```lua

   -- Modify `chatroom.lua` to include a handler for `Members`
   -- to register to the chatroom with the following code:

     Handlers.add(
       "Register",
       { Action = "Register"},
       function (msg)
         table.insert(Members, msg.From)
         print(msg.From .. " Registered")
         msg.reply({ Data = "Registered." })
       end
     )
   ```

   ![Register Handler](/chatroom5.png)

   This handler will allow processes to register to the chatroom by responding to the tag `Action = "Register"`. A printed message will confirm stating `registered` will appear when the registration is successful.

2. **Reload and Test:** Let's reload and test the script by registering ourselves to the chatroom.

   - Save and reload the script in aos using `.load chatroom.lua`.
   - Check to see if the register handler loaded with the following script:

   ```lua
    Handlers.list
   ```

   ![Checking the Handlers List](/chatroom6.png)

   This will return a list of all the handlers in the chatroom. Since this is most likely your first time developing in `aos`, you should only see one handler with the name `Register`.

   - Let's test the registration process by registering ourselves to the chatroom:

   ```lua
   Send({ Target = ao.id, Action = "Register" })
   ```

   If successful, you should see that there was a `message added to your outbox` and that you then see a new printed message that says `registered`.

   ![Registering to the Chatroom](/chatroom7.png)

   - Finally, let's check to see if we were successfully added to the `Members` list:

   ```lua
    Members
   ```

   If successful, you'll now see your process ID in the `Members` list.

   ![Checking the Members List](/chatroom8.png)

### Adding a Broadcast Handler

Now that you have a chatroom, let's create a handler that will allow you to broadcast messages to all members of the chatroom.

- Add the following handler to the `chatroom.lua` file:

  ```lua
    Handlers.add(
      "Broadcast",
      { Action = "Broadcast" },
      function (msg)
        for _, recipient in ipairs(Members) do
          ao.send({Target = recipient, Data = msg.Data})
        end
        msg.reply({Data = "Broadcasted." })
      end
    )
  ```

  This handler will allow you to broadcast messages to all members of the chatroom.

- Save and reload the script in aos using `.load chatroom.lua`.
- Let's test the broadcast handler by sending a message to the chatroom:

  ```lua
  Send({Target = ao.id, Action = "Broadcast", Data = "Broadcasting My 1st Message" }).receive().Data
  ```

## Step 5: Inviting Morpheus to the Chatroom

Now that you've successfully registered yourself to the chatroom, let's invite Morpheus to join us. To do this, we'll send an invite to him that will allow him to register to the chatroom.

Morpheus is an autonomous agent with a handler that will respond to the tag `Action = "Join"`, in which will then have him use your `Register` tag to register to the chatroom.

- Let's send Morpheus an invitation to join the chatroom:
  ```lua
  Send({ Target = Morpheus, Action = "Join" })
  ```
- To confirm that Morpheus has joined the chatroom, check the `Members` list:

  ```lua
  Members
  ```

  If successful, you'll receive a broadcasted message from Morpheus.

## Step 6: Inviting Trinity to the Chatroom

Within this message, he'll give you Trinity's process ID and tell you to invite her to the chatroom.

Use the same processes to save her process ID as `Trinity` and to invite her to the chatroom as you did with Morpheus.

If she successfully joins the chatroom, she'll then pose the next challenge to you, creating a [token](token).

## Engaging Others in the Chatroom

### Onboarding Others

- Invite aos Users:
  Encourage other aos users to join your chatroom. They can register and participate in the broadcast.

- Provide Onboarding Instructions:
  Share a simple script with them for easy onboarding:

```lua
-- Hey, let's chat on aos! Join my chatroom by sending this command in your aos environment:
Send({ Target = [Your Process ID], Action = "Register" })
-- Then, you can broadcast messages using:
Send({Target = [Your Process ID], Action = "Broadcast", Data = "Your Message" })
```

## Next Steps

Congratulations! You've successfully built a chatroom in `ao` and have invited Morpheus to join you. You've also created a broadcast handler to send messages to all members of the chatroom.

Next, you'll continue to engage with Morpheus, but this time you'll be adding Trinity to the conversation. She will lead you through the next set of challenges. Good Luck!

```

## File: tutorials/begin/dao.md
```
# DAO Guide

This guide brings you through the process of building a DAO using aos. If you have not already, you will need to first build a [token](./token.md) in aos. We will load the DAO code into aos alongside the token code from the [token](./token.md) guide. In the context of ao a DAO may be used to govern MU, CU, and SU nodes.

In our DAO we will implement a process known as "slashing". In the case of ao, if a unit is misbehaving, other units may vote to slash them. Slashing means they will lose their stake, we will get more into stake later.

Make a new directory called `dao` and copy in the token.lua created in the token guide.

```sh
mkdir dao
cd dao
cp ../token/token.lua .
```

Now create a new file called `dao.lua` and open it in your favorite editor.

## Writing the DAO code

### Initializing state

Open up dao.lua and add the following lines

```lua
Balances = Balances or {}
Stakers = Stakers or {}
Unstaking = Unstaking or {}
Votes = Votes or {}
```

These tables store the state of the DAO, including user Balances, staked tokens, Unstaking requests, and voting records.

### Staking

Staking is the process of putting your tokens up to give you the ability to vote. If someone wishes to obtain the ability to vote they must possess and stake some of their tokens. Let's add a Handler for staking. A member or node in ao would want to stake if they want to obtain the ability to vote to slash or keep a node, which we will discuss further later.

```lua
-- Stake Action Handler
Handlers.stake = function(msg)
    local quantity = tonumber(msg.Tags.Quantity)
    local delay = tonumber(msg.Tags.UnstakeDelay)
    local height = tonumber(msg['Block-Height'])
    assert(Balances[msg.From] and Balances[msg.From] >= quantity, "Insufficient balance to stake")
    Balances[msg.From] = Balances[msg.From] - quantity
    Stakers[msg.From] = Stakers[msg.From] or {}
    Stakers[msg.From].amount = (Stakers[msg.From].amount or 0) + quantity
    Stakers[msg.From].unstake_at = height + delay
end
```

The above takes the quantity and a delay from the incoming message, and if the From has enough balance, puts the stake into the Stakers table. The delay represents a future time when the tokens can be unstaked.

### Unstaking

Unstaking is the process of withdrawing staked tokens. If someone Unstaked all their tokens they would be giving up the ability to vote. Here we provide a handler for Unstaking.

```lua
-- Unstake Action Handler
Handlers.unstake = function(msg)
    local quantity = tonumber(msg.Tags.Quantity)
    local stakerInfo = Stakers[msg.From]
    assert(stakerInfo and stakerInfo.amount >= quantity, "Insufficient staked amount")
    stakerInfo.amount = stakerInfo.amount - quantity
    Unstaking[msg.From] = {
        amount = quantity,
        release_at = stakerInfo.unstake_at
    }
end
```

This pushes into the Unstaking table, an incoming amount from the Message and reduces the amount they have staked `stakerInfo.amount = stakerInfo.amount - quantity`.

### Voting

Voting is the process which governs the DAO. When the Vote Message is sent, members receive a Vote proportional to the amount they have staked. The deadline variable represents when the vote will be applied.

```lua
-- Vote Action Handler
Handlers.vote = function(msg)
    local quantity = Stakers[msg.From].amount
    local target = msg.Tags.Target
    local side = msg.Tags.Side
    local deadline = tonumber(msg['Block-Height']) + tonumber(msg.Tags.Deadline)
    assert(quantity > 0, "No staked tokens to vote")
    Votes[target] = Votes[target] or { yay = 0, nay = 0, deadline = deadline }
    Votes[target][side] = Votes[target][side] + quantity
end
```

Here, if the Process or user sending the vote has some tokens they can place an entry in the Votes table. The `side` yay or nay, is set to the quantity of their stake. In our example a "nay" vote is a vote to slash and a "yay" vote is a vote to keep.

The msg.Tags.Target sent in would represent something being voted on. In the case of AO this may be the wallet address of a MU, CU, or SU which members are voting to slash.

### Finalization

There is some logic that we want to run on every Message. We will define this as the `finalizationHandler`. Getting slashed means you are losing your stake in the DAO.

```lua
-- Finalization Handler
local finalizationHandler = function(msg)
  local currentHeight = tonumber(msg['Block-Height'])
  -- Process unstaking
  for address, unstakeInfo in pairs(Unstaking) do
      if currentHeight >= unstakeInfo.release_at then
          Balances[address] = (Balances[address] or 0) + unstakeInfo.amount
          Unstaking[address] = nil
      end
  end
  -- Process voting
  for target, voteInfo in pairs(Votes) do
      if currentHeight >= voteInfo.deadline then
          if voteInfo.nay > voteInfo.yay then
              -- Slash the target's stake
              local slashedAmount = Stakers[target] and Stakers[target].amount or 0
              Stakers[target].amount = 0
          end
          -- Clear the vote record after processing
          Votes[target] = nil
      end
  end
end
```

### Attaching the Handlers to incoming Message Tags

Here we add a helper function called `continue` which will allow us to execute through to the finalizationHandler on every message.

```lua
-- wrap function to continue handler flow
function continue(fn)
    return function (msg)
      local result = fn(msg)
      if (result) == -1 then
        return 1
      end
      return result
    end
end
```

Finally we will register all the Handlers and wrap them in continue in order to always reach the finalizationHandler for every Stake, Unstake, and Vote Message.

```lua
-- Registering Handlers
Handlers.add("stake",
  continue(Handlers.utils.hasMatchingTag("Action", "Stake")), Handlers.stake)
Handlers.add("unstake",
  continue(Handlers.utils.hasMatchingTag("Action", "Unstake")), Handlers.unstake)
Handlers.add("vote",
  continue(Handlers.utils.hasMatchingTag("Action", "Vote")), Handlers.vote)
-- Finalization handler should be called for every message
Handlers.add("finalize", function (msg) return -1 end, finalizationHandler)
```

## Loading and Testing

Now that we have dao.lua complete we can load it into aos alongside token.lua from the [token](./token.md) guide. Run a new aos Process called `dao` while also loading dao.lua and token.lua

```sh
aos dao --load token.lua --load dao.lua
```

From another terminal run another aos Process called voter

```sh
aos voter
```

Now from the dao aos shell send that voter some tokens

```lua
Send({ Target = ao.id, Tags = { Action = "Transfer", Recipient = 'process id of the voter aos', Quantity = '100000' }})
```

From another terminal run another aos Process called cu

```sh
aos cu
```

Now from the dao aos shell send that cu some tokens

```lua
Send({ Target = ao.id, Tags = { Action = "Transfer", Recipient = 'process id of the cu aos', Quantity = '100000' }})
```

Check the Balances from the dao aos shell, we should see a balance for the voter and cu Process. In the below examples `bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s` is the dao aos, `QcGIOXJ1p2SOGzGAccOcV-nSudVRiaPYbU7SjeLx1OE` is the voter aos, and `X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s` is the cu aos.

```lua
Balances
{
  'QcGIOXJ1p2SOGzGAccOcV-nSudVRiaPYbU7SjeLx1OE': 100000,
  bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s: 99999999900000,
  X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s: 100000
}
```

From the voter aos Process, Stake some tokens

```lua
Send({ Target = "bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s", Tags = { Action = "Stake", Quantity = '1000', UnstakeDelay = "10" }})
```

From the cu aos Process, Stake some tokens

```lua
Send({ Target = "bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s", Tags = { Action = "Stake", Quantity = '1000', UnstakeDelay = "10" }})
```

This means we want to Stake 1000 tokens for 10 blocks. So after 10 blocks we have the ability to Unstake.

Check the value of the Stakers table from the dao aos shell

```lua
Stakers
{
  'QcGIOXJ1p2SOGzGAccOcV-nSudVRiaPYbU7SjeLx1OE': { amount: 1000, unstake_at: 1342634 },
  X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s: { amount: 1000, unstake_at: 1342634 }
}

```

Now lets vote to slash the cu from the voter aos process, our vote takes effect in 1 block

```lua
Send({ Target = "bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s", Tags = { Action = "Vote", Target = "X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s(the cu aos)", Side = "nay", Deadline = "1"  }})
```

From the dao aos check the Votes

```lua
 Votes
{
  X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s: { nay: 1000, yay: 0, deadline: 1342627 }
}

```

Now wait for Arweave to reach the deadline block height and then send a Stake Message from the dao aos just to trigger the finalizationHandler. You can check the block height at [https://arweave.net/](https://arweave.net/)

```lua
Send({ Target = ao.id, Tags = { Action = "Stake", Quantity = '1000', UnstakeDelay = "10" }})
```

Now check Votes and Stakers, Votes should be empty and the cu aos Process should have lost their Stake.

```lua
 Votes
[]
 Stakers
{
  'QcGIOXJ1p2SOGzGAccOcV-nSudVRiaPYbU7SjeLx1OE'(voter aos process): { amount: 1000, unstake_at: 1342647 },
  bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s(dao aos process): { amount: 1000, unstake_at: 1342658 },
  X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s(cu aos process): { amount: 0, unstake_at: 1342647 }
}

```

Finally lets Unstake our tokens from the voter aos process

```lua
Send({ Target = "bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s", Tags = { Action = "Unstake", Quantity = '1000'}})
```

And check the Stakers table from the dao aos

```lua
 Stakers
{
  'QcGIOXJ1p2SOGzGAccOcV-nSudVRiaPYbU7SjeLx1OE': { amount: 0, unstake_at: 1342647 },
  bclTw5QOm5soeMXoaBfXLvzjheT1_kwc2vLfDntRE4s: { amount: 1000, unstake_at: 1342658 },
  X6mkYwt87mIsfsQzDAJr54S0BBxLrDwWMdq7seBcS6s: { amount: 0, unstake_at: 1342647 }
}

```

That concludes the DAO Guide we hope it was helpful!

```

## File: tutorials/begin/index.md
```
---
prev:
  text: "Tutorials"
  link: "../index"
next:
  text: "Preparations"
  link: "/tutorials/begin/preparations"
---

# Begin: An Interactive Tutorial

In this tutorial series, you'll walk through an interactive steps that will help you deepen your knowledge and understanding of the aos environment.

::: info

### The Exercise

In this fun exercise, you'll encounter a series of challenges presented by two familiar characters, Morpheus and Trinity. You'll dive deep `into the rabbit hole` guided by Morpheus as he presents you with a series of challenges to prove you're `the one`. Once you've completed all of the challenges presented by both Morpheus and Trinity, you'll receive a token that grants you access to an exclusive chatroom within ao called `The Construct`.

Now, let's get started [down the rabbit hole.](preparations)
![White Rabbit](/white_rabbit_outline.svg)
:::

## Tutorials

### Getting Started - An Interactive Tutorial

- [1. Quick Start](preparations)
- [2. Messaging](messaging)
- [3. Creating a Chatroom](chatroom)
- [4. Build a Token](token)

```

## File: tutorials/begin/messaging.md
```
<script setup>
  import {onMounted} from "vue"
  import {renderRepl} from "../../tools/replRenderer.jsx"

  const codes = {
    "step-3": `Send({ Target = "process ID", Data = "Hello World!" })`,
    "step-4": `Morpheus = "ajrGnUq9x9-K1TY1MSiKwNWhNTbq7-IdtFa33T59b7s"`,
    "step-4-1": `Morpheus`,
    "step-5": `Send({ Target = Morpheus, Data = "Morpheus?" })`,
    "step-6": `#Inbox`,
    "step-6-1": `Inbox[#Inbox].Data`,
    "step-7": `Send({ Target = Morpheus, Data = "Code: rabbithole", Action = "Unlock" })`,
    "step-7-2": `Inbox[#Inbox].Data`
  }

  onMounted(() => {
      Object.keys(codes).forEach((key) => {
        renderRepl(key, codes[key])
      })
    }
  )
</script>

# Messaging in `ao`

## Learn how Messages gives `ao` Parallel Compute Capability

In `ao`, every process runs in parallel, creating a highly scalable environment. Traditional direct function calls between processes aren't feasible because each process operates independently and asynchronously.

Messaging addresses this by enabling asynchronous communication. Processes send and receive messages rather than directly invoking functions on each other. This method allows for flexible and efficient interaction, where processes can respond to messages, enhancing the system's scalability and responsiveness.

We'll begin by exploring the basics of messaging in `aos`, how to see messages received in your inbox, and how to send messages to other processes.

## Video Tutorial

<iframe width="680" height="350" src="https://www.youtube.com/embed/6aCjKK6F1yQ?si=3Ny7U-GgyNsRWlXS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Step 1: Understand the Message Structure

- **Message Basics:** Messages in `ao` are built using Lua tables, which are versatile data structures that can hold multiple values. Within these tables, the "Data" field is crucial as it contains the message's content or payload. This structure allows for efficient sending and receiving of information between processes, showcasing how `ao` primitives leverage Arweave's underlying capabilities to facilitate complex, composable operations.

  For detailed specifications, please refer to the original documentation on the [G8way specs page](https://specs.g8way.io/?tx=xwOgX-MmqN5_-Ny_zNu2A8o-PnTGsoRb_3FrtiMAkuw).

- **Example**: `{ Data = "Hello from Process A!" }` is a simple message.

## Step 2: Open the aos CLI

- Launch the aos command-line interface (CLI) by typing `aos` in your terminal and pressing Enter.

```sh
aos
```

## Step 3: How to Send a Message

```lua
Send({ Target = "process ID", Data = "Hello World!" })
```

<div id="step-3"></div>

- **Send**: The `Send` function is globally available in the aos interactive environment.
- **Target**: To send a message to a specific process, include a `Target` field in your message.
- **Data**: The `Data` is the text message you want received by the receiving process. In this example, the message is "Hello World!".

## Step 4: Store `Morpheus`'s Process ID

We'll use the process ID provided below and store it as a variable called Morpheus.

```lua
ajrGnUq9x9-K1TY1MSiKwNWhNTbq7-IdtFa33T59b7s
```

Copy the process ID above and store it as a variable by running the below command in the aos CLI:

```lua
Morpheus = "ajrGnUq9x9-K1TY1MSiKwNWhNTbq7-IdtFa33T59b7s"
```

<div id="step-4"></div>

This will store the process ID as a variable called `Morpheus`, making it easier to interact with the specific process ID.

::: info
When creating the `Morpheus` variable, the only response you should see is `undefined`. This is expected. To check if the variable was created successfully, type `Morpheus` and press Enter. You should see the process ID you stored.
:::

### Check the `Morpheus` Variable

```lua
-- Check the Morpheus variable by typing `Morpheus`
 Morpheus
-- Expected Results:
ajrGnUq9x9-K1TY1MSiKwNWhNTbq7-IdtFa33T59b7s


-- If `undefined` is returned,
-- then the variable was not created successfully.
```

<div id="step-4-1"></div>

## Step 5: Send a Message to Morpheus

After obtaining Morpheus's process ID and storing it in a variable, you're ready to communicate with it. To do this, you use the Send function. Morpheus, himself, is a parallel process running in ao. He receives and sends messages using a series of Handlers. Let's send him a message and see what happens.

```lua
Send({ Target = Morpheus, Data = "Morpheus?" })
```

<div id="step-5"></div>

- Your `Target` is `Morpheus` which is the variable we defined earlier using `Morpheus`'s process ID.
- The `Data` is the message you want to send to Morpheus. In this case, it's "Morpheus?".

**Expected Results:**

```lua
-- Your Message Command
 Send({ Target = Morpheus, Data = "Morpheus?"})
-- Message is added to the outbox
message added to outbox
-- A New Message is received from `Morpheus`'s process ID
New Message From BWM...ulw: Data = I am here. You are f

```

You've sent a message to Morpheus and received a response, but you can't read the full message. Let's learn about the `Inbox` and how to read messages.

## Step 6: The Inbox

The `Inbox` is where you receive messages from other processes.
::: info
To see an in depth view of an inbox message, head over to the [Messages](../../concepts/messages) Concepts page.
:::

Let's check your inbox to see how many messages you have received.

Inside your aos CLI, type the following command:

```lua
 #Inbox
```

<div id="step-6"></div>

If you're actively following through the tutorial, the inbox will not have many messages. However, if you've been experimenting with the aos environment, you may more than 1 message in your inbox.

**Example Return:**

```lua
-- Your Inbox Command
 #Inbox
-- The command will return the number of messages in your inbox.
4

```

In the example above, the return is `4`, stating that there are four messages in the inbox.

As we're actively looking for `Morpheus`'s response, we'll assume his message was the last one received. To read the last message in your inbox, type the following command:

```lua
 Inbox[#Inbox].Data
```

<div id="step-6-1"></div>

This command allows you to isolate the Data from the message and only read the contents of the data.

The Expected Return:

```lua
-- Your Inbox[x].Data Command
 Inbox[#Inbox].Data
-- The command will return the `Data` of the message.
-- Data is what usually represents the text-based message
-- received from one process to another.
I am here. You are finally awake. Are you ready to see how far the rabbit hole goes?

```

You are now using your own process to communicate with Morpheus, another parallel process running in ao. You're now ready to move on to the next step in the tutorial.

## Step 7: Sending Messages with Tags

**Purpose of Tags**: Tags in aos messages are used to categorize, route, and process messages efficiently. They play a crucial role in message handling, especially when dealing with multiple processes or complex workflows.

Some processes use `Handlers` that specifically interact with messages that have certain tags. For example, a process may have a handler that only interacts with messages that have a specific tag, which we'll see an example of in the [chatroom](chatroom) tutorial.

### How to Use Tags in Messages

In the case of Morpheus, we can use tags to categorize our messages, and because Morpheus is a autonomous process, he has handlers that can interact with messages that have certain tags.

**Adding Tags to a Message**:

- We already know that the `Data` of a message is the text-based message you want to send to another process. Earlier, we sent a message to Morpheus without any tags, in which he used a handler to respond to an exact matching data.

### Let's Show Morpheus That We're Ready

Send Morpheus a message with the tag `Action` and the value `rabbithole`.

**Example:**

```lua
Send({ Target = Morpheus, Data = "Code: rabbithole", Action = "Unlock" })
```

<div id="step-7"></div>

**Read the message from Morpheus:**

```lua
Inbox[#Inbox].Data
```

<div id="step-7-2"></div>

**Expected Return:**
![Morpheus Responds 2](/messaging2.png)

## Additional Tips for Using Tags

- **Consistent Tagging**: Develop a consistent tagging system for your application to make message handling more predictable.
- **Tag Naming**: Choose clear and descriptive names for your tags. This makes it easier to understand the purpose and context of messages at a glance.
- **Security with Tags**: Remember that tags are not encrypted or hidden, so avoid using sensitive information as tags.

## Advanced Usage of Tags

- **Workflow Management**: Tags can be instrumental in managing workflows, especially in systems where messages pass through multiple stages or processes.

## Additional Tips for Messaging

- **Message Structure**: Explore other fields like `Epoch`, `From`, and `Nonce` for more complex messaging needs.
- **Debugging**: Use the [`Dump`](/concepts/tour.html#_6-data-representation-with-dump) function to print messages for debugging.
- **Security Considerations**: Be cautious with the content and handling of messages, and never send anything considered private or sensitive.

## Conclusion

You've now learned how to send messages with tags, which is a powerful tool for categorizing and routing messages in aos.

Morpheus has officially invited you to the next stage of your journey. You're now ready to move on to the next step in the tutorial, [Creating a Chatroom](chatroom).

```

## File: tutorials/begin/preparations.md
```
# Preparations

::: info
**The Awakening Begins:**

You've always known there's more to this world, just outside of your reach. You've been searching for it, not even knowing what it was you were looking for. It... is `ao`.

We begin our journey by installing the `aos` client and starting a new process. This will allow us to interact with the ao computer and complete the rest of the tutorial.
:::

## Video Tutorial

<iframe width="680" height="350" src="https://www.youtube.com/embed/nhMZup9uVBQ?si=Ex0W_G-PZA1I9rH8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## System requirements

The local client of aos is very simple to install. Just make sure you have:

- [NodeJS](https://nodejs.org) version 20+. (If you haven't yet installed it, check out [this page](https://nodejs.org/en/download/package-manager) to find instructions for your OS).
- A code editor of your choice.

:::info
Though it's not required, we do recommend installing the [ao addon](../../references/editor-setup) into your text editor of choice to optimize your experience with `aos`.
:::

## Installing aos

Once you have NodeJS on your machine, all you need to do is install aos and run it:

```sh
npm i -g https://get_ao.g8way.io
```

After installation, we can simply run the command itself to start a new aos process!

```sh
aos
```

## Welcome to the rabbit hole

The utility you just started is a local client, which is ready to relay messages for you to your new process inside the ao computer.

After it connects, you should see the following:

```sh
          _____                   _______                   _____
         /\    \                 /::\    \                 /\    \
        /::\    \               /::::\    \               /::\    \
       /::::\    \             /::::::\    \             /::::\    \
      /::::::\    \           /::::::::\    \           /::::::\    \
     /:::/\:::\    \         /:::/~~\:::\    \         /:::/\:::\    \
    /:::/__\:::\    \       /:::/    \:::\    \       /:::/__\:::\    \
   /::::\   \:::\    \     /:::/    / \:::\    \      \:::\   \:::\    \
  /::::::\   \:::\    \   /:::/____/   \:::\____\   ___\:::\   \:::\    \
 /:::/\:::\   \:::\    \ |:::|    |     |:::|    | /\   \:::\   \:::\    \
/:::/  \:::\   \:::\____\|:::|____|     |:::|    |/::\   \:::\   \:::\____\
\::/    \:::\  /:::/    / \:::\    \   /:::/    / \:::\   \:::\   \::/    /
 \/____/ \:::\/:::/    /   \:::\    \ /:::/    /   \:::\   \:::\   \/____/
          \::::::/    /     \:::\    /:::/    /     \:::\   \:::\    \
           \::::/    /       \:::\__/:::/    /       \:::\   \:::\____\
           /:::/    /         \::::::::/    /         \:::\  /:::/    /
          /:::/    /           \::::::/    /           \:::\/:::/    /
         /:::/    /             \::::/    /             \::::::/    /
        /:::/    /               \::/____/               \::::/    /
        \::/    /                 ~~                      \::/    /
         \/____/                                           \/____/

Welcome to AOS: Your operating system for AO, the decentralized open
access supercomputer.

Type ".load-blueprint chat" to join the community chat and ask questions!

AOS Client Version: 1.12.1. 2024
Type "Ctrl-C" twice to exit

Your AOS process:  QFt5SR6UwJSCnmgnROq62-W8KGY9z96k1oExgn4uAzk

default@aos-0.2.2[Inbox:1]>

```

Let's walk through the initial printout after running `aos`:

![aos print](/aos-print.png)

After running `aos` in your terminal, you should see:

- An ASCII art image of `AOS`.
- A Welcome Message
- The version of `aos` you are running.
- An instructional exit message.
- Your process ID.

::: info
If your OS version is different than the latest version, a message asking if you'd like to update the version will appear. If so, simply exit the process by pressing "Ctrl+C" twice, run `npm i -g https://get_ao.g8way.io` to update, and then run `aos` again.
:::

Welcome to your new home in the ao computer! The prompt you are now looking at is your own personal server in this decentralized machine.

Now, let's journey further down the rabbit hole by exploring one of the two core concept type of ao: [messaging](messaging).

```

## File: tutorials/begin/rabbithole.md
```
# Enter `The Construct` - An Interactive Tutorial

![White Rabbit](/white_rabbit_outline.svg)

## Wake up, Neo...

Are you ready to see how deep the rabbit hole goes?

This interactive tutorial will take what you've learned so far and apply it towards a mission.

### The Mission: Break Out of the Matrix and Enter "The Construct".

The construct is a tokengated chatroom inside ao that is only accessible to those who have completed a series of tasks.

**Now... let's begin.**

::: warning
You must have the latest versions of aos installed to complete this tutorial.
:::

### 1. Locate Morpheus

Morpheus' process ID:

```
9yOQrYNwIfIOeSswRDGUMd5gvMWJKxleInD_95DEC4A
```

Take his process ID and name is "Morpheus" inside aos. This is the first step to entering the construct.

```lua
Morpheus = "9yOQrYNwIfIOeSswRDGUMd5gvMWJKxleInD_95DEC4A"
```

Send a message to Morpheus, and tell him you are ready to begin.

```lua
Send({ Target = Morpheus, Data = "I'm Ready" })
```

When you've sent this message, he'll respond with the next step. Follow the instructions he gives you, and you'll be on your way to the construct.

::: info
If you need help understanding the messaging process, review the [Messaging](messaging) tutorial.
:::

### 2. Prove Yourself to Morpheus

Morpehus will give you a series of tasks to complete.
The tasks will involve:

- Building a [Chatroom](chatroom).
- Broadcasting messages within the Chatroom.
- Writing a custom Handler for the Chatroom.

When you've completed these tasks, Morpheus will give you instructions for the next step, which will involve locating Trinity.

### 3. Locate Trinity

Trinity's process ID can only be obtained by completing Morpheus' tasks.

Once you've received Trinity's process ID, you will need to name it "Trinity" inside aos. You'll then message her `"White Rabbit"`.

```lua
Send({ Target = Trinity, Data = "White Rabbit" })
```

She will respond and the next phase of the tutorial will begin.

### 4. Prove Yourself to Trinity

Much like Morpheus, Trinity will give you a series of tasks to complete.

The tasks will involve:

- Creating a [Token](token).
- Tokenizing the chatroom you built for Morpheus.
- Create your own [Game and Bot](/tutorials/bots-and-games/index).
- Register your process within the tokenized chatroom.

Once you've completed these tasks, Trinity will give you instructions for the next phase of the tutorial.

### 5. Receive the Token to the Construct

By completing the tasks of Morpheus and Trinity, you will receive a token that will allow you to enter the Construct.

### 6. Enter the Construct

Trinity will then give you instructions on how to use the token to enter the Construct.

Once you've entered the Construct, you will be able to chat with others who have completed the tutorial.

```

## File: tutorials/begin/token.md
```
# Crafting a Token

::: info
Diving deeper into the `ao`, you're now ready to create your own token, a symbol of value and exchange within this decentralized medium. If you've found yourself wanting to learn how to create a token, but haven't visited the [Messaging](messaging) and [Build a Chatroom](chatroom) lessons, be sure to do so as this page is part of a multi-part interactive tutorial.
:::

When creating tokens, we'll continue to use the [Lua Language](../../references/lua.md) within `ao` to mint a token, guided by the principles outlined in the [Token Specification](../../references/token.md).

## Video Tutorial

<iframe width="680" height="350" src="https://www.youtube.com/embed/yge5Oo7K1vM?si=f3vt2eAbL3ON-DBz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Continuing Down the Rabbit Hole

In our last tutorial, [Build a Chatroom](chatroom), we learned how to create a chatroom within `ao`, invited both `Morpheus` and `Trinity` to the chatroom we created, and then `Trinity` has now asked for us to create a token for her as a way of proving ourselves worthy of continuing down the rabbit hole.

**Let us begin.**

## The Two Paths To Building a Token

There are two paths to take when building a token:

1. **The Blueprint**: This is a predesigned template that helps you quickly build a token in `ao`. It is a great way to get started and can be customized to fit your needs.

   Check here to learn more about the [Token Blueprint](../../guides/aos/blueprints/token.md).

2. **The Manual Method**: This is a step-by-step guide to building a token in `ao` from scratch. This path is for those who want to understand the inner workings of a token and how to build one from the ground up.

   Check here to review the full [Build a Token](../../guides/aos/token.md) guide.

## The Blueprint Method

For this tutorial, we'll be using the Token Blueprint to create a token for `Trinity`. This is a predesigned template that helps you quickly build a token in `ao`.

### How To Use The Token Blueprint

1. Make sure we're in the same directory as before during the previous steps in the tutorial.
2. Open the Terminal.
3. Start your `aos` process.
4. Type in `.load-blueprint token`

This will load the required handlers for the tutorials token within `ao`. It's important to note that the token blueprint isn't specific to this tutorial and can be used as a foundation for any token you wish to create.

### Verify the Blueprint is Loaded

Type in `Handlers.list` to see the newly loaded handlers.

You should see a new list of handlers that have been loaded into your `aos` process. If you've been following along the with the previous steps in the tutorial, you should also see the handlers for your chatroom, as well.

**Example:**

![Token Handlers](/token3.png)

### Testing the Token

Now that the token blueprint is loaded, we can test the token by sending a message to ourselves using the `Action = "Info"` tag.

```lua
Send({ Target = ao.id, Action = "Info" }).receive().Tags
```

This will print the token information to the console. It should show your process ID with the total balance of tokens available.

### Sending Tokens to Trinity

Now that we've tested the token and it's working as expected, we can send some tokens to `Trinity`. We'll send 1000 tokens to `Trinity` using the `Action = "Transfer"` tag.

```lua
Send({ Target = ao.id, Action = "Transfer", Recipient = Trinity, Quantity = "1000"}).receive().Data
```

When `Trinity` receives the tokens, she'll respond to the transfer with a message to confirm that she's received the tokens.

Her response will look something like this:

`Trinity:` "Token received. Interesting. I wasn't sure you'd make it this far. I'm impressed, but we are not done yet. I want you to use this token to tokengate the chatroom. Do that, and then I will believe you could be the one."

You've completed the process of creating a token and sending it to `Trinity`. You're now ready to move on to the next step in the tutorial. [Tokengating the Chatroom](tokengating).

```

## File: tutorials/begin/tokengating.md
```
# Tokengating the Chatroom

::: info
Now that we've created a token and sent it to `Trinity`, we can use the token to tokengate our chatroom. This will allow only those who have the token to enter the chatroom.
:::

## Video Tutorial

<iframe width="680" height="350" src="https://www.youtube.com/embed/VTYmd_E4Igc?si=CEQ0i8qeh33-eJKN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## How to Tokengate the Chatroom

Let's create a handler that will allow us to tokengate the chatroom. This handler will respond to the tag `Action = "Broadcast"` meaning it will replace the original `Broadcast` handler we built for our chatroom.

## Step 1: Start the same `aos` process.

Be sure you're using the same `aos` process that you've used throughout the tutorial.

## Step 2: Open the `chatroom.lua` file.

This is the same file we used to create the chatroom during the [chatroom](chatroom) tutorial.

## Step 3: Edit your `Broadcast` handler.

Replace the original `Broadcast` handler with the following code:

```lua
Handlers.add(
    "Broadcast",
    { Action = "Broadcast" },
    function(m)
        if Balances[m.From] == nil or tonumber(Balances[m.From]) < 1 then
            print("UNAUTH REQ: " .. m.From)
            return
        end
        local type = m.Type or "Normal"
        print("Broadcasting message from " .. m.From .. ". Content: " .. m.Data)
        for i = 1, #Members, 1 do
            ao.send({
                Target = Members[i],
                Action = "Broadcasted",
                Broadcaster = m.From,
                Data = m.Data
            })
        end
    end
)
```

This handler will now check the balance of the sender's token before broadcasting the message to the chatroom. If the sender doesn't have a token, the message will not be broadcasted.

Save the file.

## Step 4: Reload the `chatroom.lua` file.

To replace the original `broadcast` handler with the new one, you'll need to reload the `chatroom.lua` file.

```lua
.load chatroom.lua
```

## Step 5: Test the Tokengate

Now that the chatroom is tokengated, let's test it by sending a message to the chatroom.

### From the original aos process

First, we'll test it from the original aos process.

```lua
Send({ Target = ao.id , Action = "Broadcast", Data = "Hello" })
```

Expected Results:

```
{
   output = "Message added to outbox",
   ...
}
Broadcasting message from [Your Process ID]. Content: Hello.
New Message From [Your Process ID]: Action = Broadcasted
```

## Testing from another Process ID.

### From a new aos process

Now, let's test it from a new aos process that doesn't have a token.

```sh
aos chatroom-no-token # the `chatroom-no-token` is the new process name
```

We'll first need to register to the chatroom.

```lua
.load chatroom.lua
Send({ Target = ao.id, Action = "Register" })
```

Expected Results:

```
message added to outbox
New Message From [Your Process ID]: Data = registered
```

Now, let's try to send a message to the chatroom.

```lua
Send({ Target = ao.id , Action = "Broadcast", Data = "Hello?" })
```

Expected Results:

```
message added to outbox
UNAUTH REQ: [New Process ID]
```

As you can see, the message was not broadcasted because the new process doesn't have a token.

## Tell Trinity "It is done"

From the original aos process, send a broadcast message to the chatroom saying, "It is done".

```lua
Send({ Target = ao.id , Action = "Broadcast", Data = "It is done" })
```

::: warning
It's important to be aware of exact match data and case sensitivity. If you're not receiving a response from either Morpheus or Trinity, be sure to check the the content of your Data and Tags.
:::

Trinity will then respond to the chatroom being tokengated.

### Expected Results:

Trinity will send a message saying, "I guess Morpheus was right. You are the one. Consider me impressed.
You are now ready to join The Construct, an exclusive chatroom available
to only those that have completed this tutorial.
Now, go join the others by using the same tag you used `Register`, with
this process ID: [Construct Process ID]
Good luck.
-Trinity". Additionally, a footer will follow the message.

## Conclusion

You've done it! You've successfully tokengated the chatroom. This has now unlocked access to the `Construct`, where only those that have fully completed this tutorial can enter.

### Congratulations!

You've shown a great deal of promise. I hope you've enjoyed this tutorial. You're now ready to build freely in `ao`.

```

## File: tutorials/bots-and-games/announcements.md
```
# Interpreting Announcements

Welcome back to your coding journey. It's time to use the skills you've acquired from previous tutorials to enhance your gaming experience.

During the game, you've likely noticed announcements appearing in your terminal. These announcements are the game's way of communicating important events to players. However, these messages can sometimes seem cryptic or you might find yourself checking your inbox frequently for further details.

Wouldn't it be convenient to access this information directly from your terminal? Well, there's a way to do that!

By using [handlers](/references/handlers.md), you can create an autonomous agent to retrieve this information for you, marking the progression from simple bots to entities capable of interpreting and acting on game events directly.

## Setting up the Development Environment

Start by creating a new file named `bot.lua` in your preferred directory.

> Ideally, this file should be placed in the same directory where your player process runs to ease the loading of the code. Else, you'll need to use relative paths to access the file.

## Writing the Code

Let's dive into the logic.

Each handler in aos requires three key pieces of information:

- `name`: A unique name for the handler
- `pattern`: A pattern for the handler to identify, triggering its operation
- `handle`: The operations to perform when the desired pattern is found.

Here's how you can write a handler for printing announcement details:

```lua
-- Handler to print game announcements directly in the terminal.
Handlers.add(
  "PrintAnnouncements",
  { Action = "Announcement" },
  function (msg)
    print(msg.Event .. ": " .. msg.Data)
  end
)
```

In this case, the name of the handler is `"PrintAnnouncements"`. It uses a special in-built utility (`hasMatchingTags`) represented by `{ Action = "Announcement" }` to check if the incoming message has been tagged as an announcement. If true, the handler prints the Event and Data, which represent the title and description of the announcement.

> [!Note]
> Once a message is "handled", it will be discarded from your `Inbox`.

## Loading and Testing

Now, let's bring this to life in the game.

Navigate to your aos player terminal and enter a game session.

Activate the handler by loading your `bot.lua` file with:

```lua
.load bot.lua
```

You'll now see game announcements appear directly in your terminal, offering real-time insights without the need to sift through your inbox.

Congratulations! You have just taken the first step in building a bot on `aos`. But let's keep working on adding more features to it 🌐

```

## File: tutorials/bots-and-games/ao-effect.md
```
---
prev:
  text: "Bots and Games"
  link: "./index"
---

# Let's Play A Game!

You've been powering through tutorials like a champ! Now, let's take a refreshing break and dive into something exciting. How about a game that adds a dash of fun to your learning journey?

![AO-Effect Game Banner](/ao-effect-game-banner.png)

## What's the game?

`ao-effect` is a game where you can compete with friends or other players globally, in real-time, right from your terminal. We've set up a global game process for this adventure.

The rules are simple. Each player starts on a 40x40 grid with health at 100 and energy at 0. Your energy replenishes over time to a maximum of 100. Navigate the grid, find other players, and use your energy to attack when they're within range. The battle continues until only one player remains or the allotted time expires.

Checkout the guides on the [Mechanics of the Arena](arena-mechanics.md) and [Expanding the Arena](build-game.md) for a deeper understanding of the game.

> Heads Up: Don't sweat it if some command syntax seem unfamiliar. Focus on understanding the purpose of each command at a high level and, most importantly, enjoy the game!

## Preparing for an Adventure in ao-effect

To join this global escapade, you'll need to set things up. Don't worry, it's as easy as 1-2-3!

1. **Install aos**

Fire up your terminal and run:

```bash
npm i -g https://get_ao.g8way.io
```

2. **Launch aos**

Next, create your instance of aos:

```bash
aos
```

3. **Set Up the Game ID**

Let's keep our game server ID handy for quick access:

```lua
Game = "tm1jYBC0F2gTZ0EuUQKq5q_esxITDFkAG6QEpLbpI9I"
```

4. **Print Game Announcements Directly To Terminal (Optional)**

Here's how you can write a handler for printing announcement details:

_This is temporary as we will be loading this via a lua script in the next section._

```lua
Handlers.add(
  "PrintAnnouncements",
  { Action = "Announcement" },
  function (msg)
    ao.send({Target = Game, Action = "GetGameState"})
    print(msg.Event .. ": " .. msg.Data)
  end
)
```

And voilà! You're all set to join the game.

## How to Register for a Game

Ready to jump in? Just a few simple steps to get you going:

### Register with the Game Server

All communication between processes in `ao` occurs through messages. To register, send this message to the game server:

```lua
Send({ Target = Game, Action = "Register" })

-- Expected Result --
{
   output = "Message added to outbox",
   onReply = function: 0x29e5ac0,
   receive = function: 0x29fe440
}
New Message From tm1...I9I: Action = Registered
New Player Registered: a1b...y1z has joined in waiting.
```

This places you in the `Waiting` Lobby. A small fee is needed to confirm your spot.

### Confirm your spot

In order to confirm your spot you need some tokens. You can acquire them by sending the following message to the game:

```lua
Send({ Target = Game, Action = "RequestTokens"}).receive().Data

-- Expected Result --
You received 10000000 from a1b2C3d4e5F6g7h8IjkLm0nOpqR8s7t6U5v4w3X2y1z
```

> [!NOTE]
> The `.receive().Data` will wait for a response by adding a temporary [Handler](../../references/handlers.md#handlers-once-name-pattern-handler) that only runs once and will print the response Data. If you would like to instead just wait for the response to hit your Inbox you can call `Send()` without `.receive()` and run `Inbox[#Inbox].Data` to see the response `Data`.
>
> Handler added by `.receive()`:
>
> ```
> {
>   name = "_once_0",
>   maxRuns = 1,
>   pattern = {  },
>   handle = function: 0x2925700
> }
> ```

Once you receive the tokens, confirm your spot by paying the game's entry fee like this:

```lua
Send({ Target = Game, Action = "Transfer", Recipient = Game, Quantity = "1000"}).receive().Data

-- Expected Result --
You transferred 1000 to tm1jYBC0F2gTZ0EuUQKq5q_esxITDFkAG6QEpLbpI9I
New Message From tm1...I9I: Action = Payment-Received
```

Wait for a few seconds, and you'll see live updates in your terminal about player payments and statuses.

## Let the Games Begin!

### Game Mechanics

Game Start: The game begins after a 2-minute `WaitTime` if at least 2 players have paid. Non-paying players are removed. If not enough players pay, those who did are refunded.

Players spawn at a random grid point once the game begins.

### It's Your Move!

Making a Move: The first thing you can do is move around, no energy required! You can shift one square in any direction – up, down, left, right, or diagonally. Along with the direction you must also pass in your player id to help the game identify your move. Here's how:

```lua
Send({ Target = Game, Action = "PlayerMove", Player = ao.id, Direction = "DownRight"})
```

The available moves across the grid are as follows:

```lua
Up = {x = 0, y = -1},
Down = {x = 0, y = 1},
Left = {x = -1, y = 0},
Right = {x = 1, y = 0},
UpRight = {x = 1, y = -1},
UpLeft = {x = -1, y = -1},
DownRight = {x = 1, y = 1},
DownLeft = {x = -1, y = 1}
```

> Keep in Mind: Directions are case sensitive!

If you move off the grid, you'll pop up on the opposite side.

### Time to Strike!

Launching an Attack: As the game progresses, you'll accumulate energy. Use it to attack other players within a 3x3 grid range. Your attack won't hurt you, but it will affect others in range.

```lua
Send({ Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = "energy_integer"})
```

Health starts at 100 and decreases with hits from other players. Reach 0, and it's game over for you.

## Wrapping Up

The game ends when there's one player left or time is up. Winners receive rewards, then it's back to the lobby for another round.

Enjoyed the game? What if there was a way to make your experience even better or boost your odds of winning. Checkout the next guide to find out 🤔

```

## File: tutorials/bots-and-games/arena-mechanics.md
```
# Mechanics of the Arena

This guide provides a comprehensive overview of the fundamental mechanics essential for designing and managing arena-style games in `aos`. In arena games, participants engage in rounds, strategically vying to eliminate each other until a sole victor emerges.

The framework presented here lays the groundwork for crafting a wide range of games, all sharing the same core functionalities. Explore the intricacies of game development and unleash your creativity within this versatile arena.

## Core Functionalities

Now, let's dive into the core functionalities that power arena-style games:

1. **Game Progression Modes:**

Arena games are structured into rounds that operate in a loop with the following progression modes: `"Not-Started"` → `"Waiting"` → `"Playing"` → `[Someone wins or timeout]` → `"Waiting"`...

> [!Note]
> The loop timesout if there are not enough players to start a game after the waiting state.

Rounds offer a defined timeframe for players to engage, intensifying the excitement of gameplay.

2. **Token Stakes:**

Players must deposit a specified quantity of tokens (defined by `PaymentQty`) to participate in the game. These tokens add a tangible stake element to the game.

3. **Bonus Rewards:**

Beyond the thrill of victory, players are enticed by the prospect of extra rewards. The builder has the flexibility to offer bonus tokens, defined by `BonusQty`, to be distributed per round. Any bets placed by players are also added to these bonuses. These bonuses serve as an additional incentive, enhancing the competitive spirit of the gameplay.

4. **Player Management:**

- Players waiting to join the next game are tracked in the `Waiting` table.
- Active players and their game states are stored in the `Players` table.
- Eliminated players are promptly removed from the `Players` table and placed in the `Waiting` table for the next game.

5. **Round Winner Reward:**

When a player eliminates another, they earn not only bragging rights but also the eliminated player's deposit tokens as a reward. Additionally, winners of each round share a portion of the bonus tokens, as well as their original stake, further motivating players to strive for victory.

6. **Listener Mode:**

For those who prefer to watch the action unfold, the "Listen" mode offers an opportunity to stay informed without active participation. Processes can register as listeners, granting them access to all announcements from the game. While they do not engage as players, listeners can continue to observe the game's progress unless they explicitly request removal.

7. **Game State Management:**

To maintain the flow and fairness of arena games, an automated system oversees game state transitions. These transitions encompass waiting, playing, and ending phases. Time durations for each state, such as `WaitTime` and `GameTime`, ensure that rounds adhere to defined timeframes, preventing games from lasting indefinitely.

You can refer to the code for the arena in the dropdown below:

<details>
  <summary><strong>Arena Game Blueprint</strong></summary>

```lua
-- ARENA GAME BLUEPRINT.

-- This blueprint provides the framework to operate an 'arena' style game
-- inside an ao process. Games are played in rounds, where players aim to
-- eliminate one another until only one remains, or until the game time
-- has elapsed. The game process will play rounds indefinitely as players join
-- and leave.

-- When a player eliminates another, they receive the eliminated player's deposit token
-- as a reward. Additionally, the builder can provide a bonus of these tokens
-- to be distributed per round as an additional incentive. If the intended
-- player type in the game is a bot, providing an additional 'bonus'
-- creates an opportunity for coders to 'mine' the process's
-- tokens by competing to produce the best agent.

-- The builder can also provide other handlers that allow players to perform
-- actions in the game, calling 'eliminatePlayer()' at the appropriate moment
-- in their game logic to control the framework.

-- Processes can also register in a 'Listen' mode, where they will receive
-- all announcements from the game, but are not considered for entry into the
-- rounds themselves. They are also not unregistered unless they explicitly ask
-- to be.

-- GLOBAL VARIABLES.

-- Game progression modes in a loop:
-- [Not-Started] -> Waiting -> Playing -> [Someone wins or timeout] -> Waiting...
-- The loop is broken if there are not enough players to start a game after the waiting state.
GameMode = GameMode or "Not-Started"
StateChangeTime = StateChangeTime or undefined

-- State durations (in milliseconds)
WaitTime = WaitTime or 2 * 60 * 1000 -- 2 minutes
GameTime = GameTime or 20 * 60 * 1000 -- 20 minutes
Now = Now or undefined -- Current time, updated on every message.

-- Token information for player stakes.
UNIT = 1000
PaymentToken = PaymentToken or "ADDR"  -- Token address
PaymentQty = PaymentQty or tostring(math.floor(UNIT))    -- Quantity of tokens for registration
BonusQty = BonusQty or tostring(math.floor(UNIT))        -- Bonus token quantity for winners

-- Players waiting to join the next game and their payment status.
Waiting = Waiting or {}
-- Active players and their game states.
Players = Players or {}
-- Number of winners in the current game.
Winners = 0
-- Processes subscribed to game announcements.
Listeners = Listeners or {}
-- Minimum number of players required to start a game.
MinimumPlayers = MinimumPlayers or 2

-- Default player state initialization.
PlayerInitState = PlayerInitState or {}

-- Sends a state change announcement to all registered listeners.
-- @param event: The event type or name.
-- @param description: Description of the event.
function announce(event, description)
    for ix, address in pairs(Listeners) do
        ao.send({
            Target = address,
            Action = "Announcement",
            Event = event,
            Data = description
        })
    end
    return print(Colors.gray .. "Announcement: " .. Colors.red .. event .. " " .. Colors.blue .. description .. Colors.reset)
end

-- Sends a reward to a player.
-- @param recipient: The player receiving the reward.
-- @param qty: The quantity of the reward.
-- @param reason: The reason for the reward.
function sendReward(recipient, qty, reason)
    if type(qty) ~= number then
      qty = tonumber(qty)
    end
    ao.send({
        Target = PaymentToken,
        Action = "Transfer",
        Quantity = tostring(qty),
        Recipient = recipient,
        Reason = reason
    })
    return print(Colors.gray .. "Sent Reward: " ..
      Colors.blue .. tostring(qty) ..
      Colors.gray .. ' tokens to ' ..
      Colors.green .. recipient .. " " ..
      Colors.blue .. reason .. Colors.reset
    )
end

-- Starts the waiting period for players to become ready to play.
function startWaitingPeriod()
    GameMode = "Waiting"
    StateChangeTime = Now + WaitTime
    announce("Started-Waiting-Period", "The game is about to begin! Send your token to take part.")
    print('Starting Waiting Period')
end

-- Starts the game if there are enough players.
function startGamePeriod()
    local paidPlayers = 0
    for player, hasPaid in pairs(Waiting) do
        if hasPaid then
            paidPlayers = paidPlayers + 1
        end
    end

    if paidPlayers < MinimumPlayers then
        announce("Not-Enough-Players", "Not enough players registered! Restarting...")
        for player, hasPaid in pairs(Waiting) do
            if hasPaid then
                Waiting[player] = false
                sendReward(player, PaymentQty, "Refund")
            end
        end
        startWaitingPeriod()
        return
    end

    LastTick = undefined
    GameMode = "Playing"
    StateChangeTime = Now + GameTime
    for player, hasPaid in pairs(Waiting) do
        if hasPaid then
            Players[player] = playerInitState()
        else
            ao.send({
                Target = player,
                Action = "Ejected",
                Reason = "Did-Not-Pay"
            })
            removeListener(player) -- Removing player from listener if they didn't pay
        end
    end
    announce("Started-Game", "The game has started. Good luck!")
    print("Game Started....")
end

-- Handles the elimination of a player from the game.
-- @param eliminated: The player to be eliminated.
-- @param eliminator: The player causing the elimination.
function eliminatePlayer(eliminated, eliminator)
    sendReward(eliminator, PaymentQty, "Eliminated-Player")
    Waiting[eliminated] = false
    Players[eliminated] = nil

    ao.send({
        Target = eliminated,
        Action = "Eliminated",
        Eliminator = eliminator
    })

    announce("Player-Eliminated", eliminated .. " was eliminated by " .. eliminator .. "!")

    local playerCount = 0
    for player, _ in pairs(Players) do
        playerCount = playerCount + 1
    end
    print("Eliminating player: " .. eliminated .. " by: " .. eliminator) -- Useful for tracking eliminations

    if playerCount < MinimumPlayers then
        endGame()
    end

end

-- Ends the current game and starts a new one.
function endGame()
    print("Game Over")

    Winners = 0
    Winnings = tonumber(BonusQty) / Winners -- Calculating winnings per player

    for player, _ in pairs(Players) do
        Winners = Winners + 1
    end

    Winnings = tonumber(BonusQty) / Winners

    for player, _ in pairs(Players) do
        -- addLog("EndGame", "Sending reward of:".. Winnings + PaymentQty .. "to player: " .. player) -- Useful for tracking rewards
        sendReward(player, Winnings + tonumber(PaymentQty), "Win")
        Waiting[player] = false
    end

    Players = {}
    announce("Game-Ended", "Congratulations! The game has ended. Remaining players at conclusion: " .. Winners .. ".")
    startWaitingPeriod()
end

-- Removes a listener from the listeners' list.
-- @param listener: The listener to be removed.
function removeListener(listener)
    local idx = 0
    for i, v in ipairs(Listeners) do
        if v == listener then
            idx = i
            break
        end
    end
    if idx > 0 then
        table.remove(Listeners, idx)
    end
end

-- HANDLERS: Game state management

-- Handler for cron messages, manages game state transitions.
Handlers.add(
    "Game-State-Timers",
    function(Msg)
        return "continue"
    end,
    function(Msg)
        Now = Msg.Timestamp
        if GameMode == "Not-Started" then
            startWaitingPeriod()
        elseif GameMode == "Waiting" then
            if Now > StateChangeTime then
                startGamePeriod()
            end
        elseif GameMode == "Playing" then
            if onTick and type(onTick) == "function" then
              onTick()
            end
            if Now > StateChangeTime then
                endGame()
            end
        end
    end
)

-- Handler for player deposits to participate in the next game.
Handlers.add(
    "Transfer",
    function(Msg)
        return
            Msg.Action == "Credit-Notice" and
            Msg.From == PaymentToken and
            tonumber(Msg.Quantity) >= tonumber(PaymentQty) and "continue"
    end,
    function(Msg)
        Waiting[Msg.Sender] = true
        ao.send({
            Target = Msg.Sender,
            Action = "Payment-Received"
        })
        announce("Player-Ready", Msg.Sender .. " is ready to play!")
    end
)

-- Registers new players for the next game and subscribes them for event info.
Handlers.add(
    "Register",
   { Action = "Register" },
    function(Msg)
        if Msg.Mode ~= "Listen" and Waiting[Msg.From] == undefined then
            Waiting[Msg.From] = false
        end
        removeListener(Msg.From)
        table.insert(Listeners, Msg.From)
        ao.send({
            Target = Msg.From,
            Action = "Registered"
        })
        announce("New Player Registered", Msg.From .. " has joined in waiting.")
    end
)

-- Unregisters players and stops sending them event info.
Handlers.add(
    "Unregister",
   { Action = "Unregister" },
    function(Msg)
        removeListener(Msg.From)
        ao.send({
            Target = Msg.From,
            Action = "Unregistered"
        })
    end
)

-- Adds bet amount to BonusQty
Handlers.add(
    "AddBet",
    { Reason = "AddBet" },
    function(Msg)
        BonusQty = tonumber(BonusQty) + tonumber(Msg.Tags.Quantity)
        announce("Bet-Added", Msg.From .. "has placed a bet. " .. "BonusQty amount increased by " .. Msg.Tags.Quantity .. "!")
    end
)

-- Retrieves the current game state.
Handlers.add(
    "GetGameState",
   { Action = "GetGameState" },
    function (Msg)
        local json = require("json")
        local TimeRemaining = StateChangeTime - Now
        local GameState = json.encode({
            GameMode = GameMode,
            TimeRemaining = TimeRemaining,
            Players = Players,
            })
        ao.send({
            Target = Msg.From,
            Action = "GameState",
            Data = GameState})
    end
)

-- Alerts users regarding the time remaining in each game state.
Handlers.add(
    "AnnounceTick",
   { Action = "Tick" },
    function (Msg)
        local TimeRemaining = StateChangeTime - Now
        if GameMode == "Waiting" then
            announce("Tick", "The game will start in " .. (TimeRemaining/1000) .. " seconds.")
        elseif GameMode == "Playing" then
            announce("Tick", "The game will end in " .. (TimeRemaining/1000) .. " seconds.")
        end
    end
)

-- Sends tokens to players with no balance upon request
Handlers.add(
    "RequestTokens",
   { Action = "RequestTokens" },
    function (Msg)
        print("Transferring Tokens: " .. tostring(math.floor(10000 * UNIT)))
        ao.send({
            Target = ao.id,
            Action = "Transfer",
            Quantity = tostring(math.floor(10000 * UNIT)),
            Recipient = Msg.From,
        })
    end
)
```

</details>

## Arena Game Blueprint

For those interested in using this arena framework, we've made this code easily accessible through a blueprint. Simply run the following code in your terminal:

```lua
.load-blueprint arena
```

## Summary

Understanding the mechanics of the arena can not only help you improve your autonomous agent created in the previous section but also empowers you to harness core functionalities for crafting your unique games.

In the upcoming section, "Building a Game," we will dive deep into the art of utilizing these mechanics to construct captivating and one-of-a-kind games within this framework. Get ready to embark on a journey into the dynamic realm of game development! 🎮

```

## File: tutorials/bots-and-games/attacking.md
```
# Automated Responses

Following our [last guide](decisions), our creation has progressed from a simple bot to a sophisticated autonomous agent. Now, let's further enhance its capabilities by adding a counterattack feature, allowing it to instantly retaliate against an opponent's attack, potentially catching them off-guard before they can retreat to safety.

## Writing the code

Add the following handler to your `bot.lua` file and you're set:

```lua
-- Handler to automatically attack when hit by another player.
Handlers.add(
  "ReturnAttack",
  { Action = "Hit" },
  function (msg)
      local playerEnergy = LatestGameState.Players[ao.id].energy
      if playerEnergy == undefined then
        print("Unable to read energy.")
        ao.send({Target = Game, Action = "Attack-Failed", Reason = "Unable to read energy."})
      elseif playerEnergy == 0 then
        print("Player has insufficient energy.")
        ao.send({Target = Game, Action = "Attack-Failed", Reason = "Player has no energy."})
      else
        print("Returning attack.")
        ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(playerEnergy)})
      end
      InAction = false
      ao.send({Target = ao.id, Action = "Tick"})
  end
)
```

Whenever your player is under attack you receive a message with the Action `Hit`. This setup ensures your agent can make a swift counter attack, given it has sufficient energy.

You can refer to the latest code for `bot.lua` in the dropdown below:

<details>
  <summary><strong>Updated bot.lua file</strong></summary>

```lua
LatestGameState = LatestGameState or nil

function inRange(x1, y1, x2, y2, range)
  return math.abs(x1 - x2) <= range and math.abs(y1 - y2) <= range
end

function decideNextAction()
  local player = LatestGameState.Players[ao.id]
  local targetInRange = false

  for target, state in pairs(LatestGameState.Players) do
    if target ~= ao.id and inRange(player.x, player.y, state.x, state.y, 1) then
        targetInRange = true
        break
    end
  end

  if player.energy > 5 and targetInRange then
    print("Player in range. Attacking.")
    ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(player.energy)})
  else
    print("No player in range or insufficient energy. Moving randomly.")
    local directionMap = {"Up", "Down", "Left", "Right", "UpRight", "UpLeft", "DownRight", "DownLeft"}
    local randomIndex = math.random(#directionMap)
    ao.send({Target = Game, Action = "PlayerMove", Player = ao.id, Direction = directionMap[randomIndex]})
  end
end

Handlers.add(
  "HandleAnnouncements",
  { Action =  "Announcement" },
  function (msg)
    ao.send({Target = Game, Action = "GetGameState"})
    print(msg.Event .. ": " .. msg.Data)
  end
)

Handlers.add(
  "UpdateGameState",
  { Action =  "GameState" },
  function (msg)
    local json = require("json")
    LatestGameState = json.decode(msg.Data)
    ao.send({Target = ao.id, Action = "UpdatedGameState"})
  end
)

Handlers.add(
  "decideNextAction",
  { Action =  "UpdatedGameState" },
  function ()
    if LatestGameState.GameMode ~= "Playing" then
      return
    end
    print("Deciding next action.")
    decideNextAction()
  end
)

Handlers.add(
  "ReturnAttack",
  { Action =  "Hit" },
  function (msg)
      local playerEnergy = LatestGameState.Players[ao.id].energy
      if playerEnergy == undefined then
        print("Unable to read energy.")
        ao.send({Target = Game, Action = "Attack-Failed", Reason = "Unable to read energy."})
      elseif playerEnergy == 0 then
        print("Player has insufficient energy.")
        ao.send({Target = Game, Action = "Attack-Failed", Reason = "Player has no energy."})
      else
        print("Returning attack.")
        ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(playerEnergy)})
      end
      InAction = false
      ao.send({Target = ao.id, Action = "Tick"})
  end
)
```

</details>

## Loading and Testing

To activate and test the counter attack feature, load the bot file in your aos player terminal:

```lua
.load bot.lua
```

Watch your terminal for the autonomous agent's reactions, now with the added ability to retaliate instantly. This feature showcases the agent's evolving strategic depth and autonomy. In the upcoming section, we'll consolidate all the knowledge we've gathered so far and add some features for optimization.

```

## File: tutorials/bots-and-games/bringing-together.md
```
# Bringing it Together

This final guide wraps up our series, where you've built up an autonomous agent piece by piece. Now, let's refine your agent with some optimizations that fine-tune its operations. Here's a quick overview of the key improvements made:

- **Sequential Command Execution:** The introduction of an `InAction` flag ensures that your agent's actions are sequential (next action occurs only when the previous is successfully executed). This critical addition prevents your agent from acting on outdated game states, enhancing its responsiveness and accuracy. The full implementation can be found in the final code for the `bot.lua` file below.

```lua
InAction = InAction or false -- Prevents the agent from taking multiple actions at once.
```

- **Dynamic State Updates and Decisions:** The agent now employs an automatic tick logic, allowing for dynamic updates and decisions. This logic enables the agent to self-trigger state updates and make subsequent decisions either upon receiving a Tick message or upon completing an action, promoting autonomous operation.

```lua
Handlers.add("GetGameStateOnTick", { Action = "Tick" }, function ()
  if not InAction then
    InAction = true
    ao.send({Target = Game, Action = "GetGameState"})
  end
end)
```

- **Automated Fee Transfer:** To further streamline its operation and ensure uninterrupted participation in games, the autonomous agent now autonomously handles the transfer of confirmation fees.

```lua
Handlers.add("AutoPay", { Action = "AutoPay" }, function ()
  ao.send({Target = Game, Action = "Transfer", Recipient = Game, Quantity = "1000"})
end)
```

In addition to these features, we've also added a logging function for debugging purposes and colored prints for better comprehension of game events. These enhancements collectively make your autonomous agent more efficient and adaptable in the game environment.

Check out the complete bot.lua code in the dropdown below, with all new additions highlighted accordingly:

<details>
  <summary><strong>Updated bot.lua file</strong></summary>

```lua
-- Initializing global variables to store the latest game state and game host process.
LatestGameState = LatestGameState or nil
InAction = InAction or false -- Prevents the agent from taking multiple actions at once.

Logs = Logs or {}

colors = {
  red = "\27[31m",
  green = "\27[32m",
  blue = "\27[34m",
  reset = "\27[0m",
  gray = "\27[90m"
}

function addLog(msg, text) -- Function definition commented for performance, can be used for debugging
  Logs[msg] = Logs[msg] or {}
  table.insert(Logs[msg], text)
end

-- Checks if two points are within a given range.
-- @param x1, y1: Coordinates of the first point.
-- @param x2, y2: Coordinates of the second point.
-- @param range: The maximum allowed distance between the points.
-- @return: Boolean indicating if the points are within the specified range.
function inRange(x1, y1, x2, y2, range)
    return math.abs(x1 - x2) <= range and math.abs(y1 - y2) <= range
end

-- Decides the next action based on player proximity and energy.
-- If any player is within range, it initiates an attack; otherwise, moves randomly.
function decideNextAction()
  local player = LatestGameState.Players[ao.id]
  local targetInRange = false

  for target, state in pairs(LatestGameState.Players) do
      if target ~= ao.id and inRange(player.x, player.y, state.x, state.y, 1) then
          targetInRange = true
          break
      end
  end

  if player.energy > 5 and targetInRange then
    print(colors.red .. "Player in range. Attacking." .. colors.reset)
    ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(player.energy)})
  else
    print(colors.red .. "No player in range or insufficient energy. Moving randomly." .. colors.reset)
    local directionMap = {"Up", "Down", "Left", "Right", "UpRight", "UpLeft", "DownRight", "DownLeft"}
    local randomIndex = math.random(#directionMap)
    ao.send({Target = Game, Action = "PlayerMove", Player = ao.id, Direction = directionMap[randomIndex]})
  end
  InAction = false -- InAction logic added
end

-- Handler to print game announcements and trigger game state updates.
Handlers.add(
  "PrintAnnouncements",
  { Action = "Announcement" },
  function (msg)
    if msg.Event == "Started-Waiting-Period" then
      ao.send({Target = ao.id, Action = "AutoPay"})
    elseif (msg.Event == "Tick" or msg.Event == "Started-Game") and not InAction then
      InAction = true -- InAction logic added
      ao.send({Target = Game, Action = "GetGameState"})
    elseif InAction then -- InAction logic added
      print("Previous action still in progress. Skipping.")
    end
    print(colors.green .. msg.Event .. ": " .. msg.Data .. colors.reset)
  end
)

-- Handler to trigger game state updates.
Handlers.add(
  "GetGameStateOnTick",
  { Action =  "Tick" },
  function ()
    if not InAction then -- InAction logic added
      InAction = true -- InAction logic added
      print(colors.gray .. "Getting game state..." .. colors.reset)
      ao.send({Target = Game, Action = "GetGameState"})
    else
      print("Previous action still in progress. Skipping.")
    end
  end
)

-- Handler to automate payment confirmation when waiting period starts.
Handlers.add(
  "AutoPay",
  { Action =  "AutoPay" },
  function (msg)
    print("Auto-paying confirmation fees.")
    ao.send({ Target = Game, Action = "Transfer", Recipient = Game, Quantity = "1000"})
  end
)

-- Handler to update the game state upon receiving game state information.
Handlers.add(
  "UpdateGameState",
  { Action =  "GameState" },
  function (msg)
    local json = require("json")
    LatestGameState = json.decode(msg.Data)
    ao.send({Target = ao.id, Action = "UpdatedGameState"})
    print("Game state updated. Print \'LatestGameState\' for detailed view.")
  end
)

-- Handler to decide the next best action.
Handlers.add(
  "decideNextAction",
  { Action =  "UpdatedGameState" },
  function ()
    if LatestGameState.GameMode ~= "Playing" then
      InAction = false -- InAction logic added
      return
    end
    print("Deciding next action.")
    decideNextAction()
    ao.send({Target = ao.id, Action = "Tick"})
  end
)

-- Handler to automatically attack when hit by another player.
Handlers.add(
  "ReturnAttack",
  { Action =  "Hit" },
  function (msg)
    if not InAction then -- InAction logic added
      InAction = true -- InAction logic added
      local playerEnergy = LatestGameState.Players[ao.id].energy
      if playerEnergy == undefined then
        print(colors.red .. "Unable to read energy." .. colors.reset)
        ao.send({Target = Game, Action = "Attack-Failed", Reason = "Unable to read energy."})
      elseif playerEnergy == 0 then
        print(colors.red .. "Player has insufficient energy." .. colors.reset)
        ao.send({Target = Game, Action = "Attack-Failed", Reason = "Player has no energy."})
      else
        print(colors.red .. "Returning attack." .. colors.reset)
        ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(playerEnergy)})
      end
      InAction = false -- InAction logic added
      ao.send({Target = ao.id, Action = "Tick"})
    else
      print("Previous action still in progress. Skipping.")
    end
  end
)
```

</details>

## What's next?

You're now equipped with the knowledge to craft intelligent autonomous agents. It's time to apply these insights into the game world. Understand the game's intricacies and leverage your agent's capabilities to dominate the arena. But there's more to come.

In future sections, we'll dive deeper into the game arena, offering advanced strategies to elevate your agent's performance. Ready to take on the challenge? Let's see what you can create! 🕹️

```

## File: tutorials/bots-and-games/build-game.md
```
---
next:
  text: "Guides"
  link: "/guides/index"
---

# Expanding the Arena

Welcome to the final guide of Chapter 2, where you'll learn to build your own game on top of the arena framework introduced in the [previous tutorial](arena-mechanics). In this guide, we'll take you through the process of creating the ["ao-effect" game](ao-effect), which you experienced at the beginning of this chapter. As you progress through this example, you'll gain insights into structuring your game's logic and interacting with the arena's core code.

Whether you're a seasoned developer or an aspiring game creator, this guide will empower you to unleash your creativity and bring your unique game ideas to life within the `aos` environment.

## Setting up the Development Environment

Start by creating a new file named `ao-effect.lua` in your preferred directory.

> [!Note]
> Ideally, this file should be placed in the same directory where your game process runs to ease the loading of the code. Else, you'll need to use relative paths to access the file.

## Writing the Code

Now, let's dive into the logic.

You'll notice that your game logic will involve calling functions and variables defined in the arena's logic. This showcases the power of composability, where your game builds on top of the existing arena logic, allowing seamless integration of variables and functions between the two. Because both logic become part of a unified logic for the game process.

### Initializing Game Mechanics

First, define essential variables and functions that set the stage for your game's mechanics:

```lua
-- AO EFFECT: Game Mechanics for AO Arena Game

-- Game grid dimensions
Width = 40 -- Width of the grid
Height = 40 -- Height of the grid
Range = 1 -- The distance for blast effect

-- Player energy settings
MaxEnergy = 100 -- Maximum energy a player can have
EnergyPerSec = 1 -- Energy gained per second

-- Attack settings
AverageMaxStrengthHitsToKill = 3 -- Average number of hits to eliminate a player

-- Initializes default player state
-- @return Table representing player's initial state
function playerInitState()
    return {
        x = math.random(Width/8),
        y = math.random(Height/8),
        health = 100,
        energy = 0
    }
end

-- Function to incrementally increase player's energy
-- Called periodically to update player energy
function onTick()
    if GameMode ~= "Playing" then return end  -- Only active during "Playing" state

    if LastTick == undefined then LastTick = Now end

    local Elapsed = Now - LastTick
    if Elapsed >= 1000 then  -- Actions performed every second
        for player, state in pairs(Players) do
            local newEnergy = math.floor(math.min(MaxEnergy, state.energy + (Elapsed * EnergyPerSec // 2000)))
            state.energy = newEnergy
        end
        LastTick = Now
    end
end
```

This code initializes your game's mechanics, including grid dimensions, player energy, and attack settings. The `playerInitState` function sets up the initial state for players when the game begins.

### Player Movement

Next, add the code for player movement:

```lua
-- Handles player movement
-- @param msg: Message request sent by player with movement direction and player info
function move(msg)
    local playerToMove = msg.From
    local direction = msg.Tags.Direction

    local directionMap = {
        Up = {x = 0, y = -1}, Down = {x = 0, y = 1},
        Left = {x = -1, y = 0}, Right = {x = 1, y = 0},
        UpRight = {x = 1, y = -1}, UpLeft = {x = -1, y = -1},
        DownRight = {x = 1, y = 1}, DownLeft = {x = -1, y = 1}
    }

    -- calculate and update new coordinates
    if directionMap[direction] then
        local newX = Players[playerToMove].x + directionMap[direction].x
        local newY = Players[playerToMove].y + directionMap[direction].y

        -- updates player coordinates while checking for grid boundaries
        Players[playerToMove].x = (newX - 1) % Width + 1
        Players[playerToMove].y = (newY - 1) % Height + 1

        announce("Player-Moved", playerToMove .. " moved to " .. Players[playerToMove].x .. "," .. Players[playerToMove].y .. ".")
    else
        ao.send({Target = playerToMove, Action = "Move-Failed", Reason = "Invalid direction."})
    end
    onTick()  -- Optional: Update energy each move
end
```

The `move` function calculates new player coordinates based on the chosen direction while ensuring that players remain within the grid boundaries. Player movement adds dynamic interaction to your game and is announced to all players and listeners.

### Player Attacks

Then you must implement the logic for player attacks:

```lua
-- Handles player attacks
-- @param msg: Message request sent by player with attack info and player state
function attack(msg)
    local player = msg.From
    local attackEnergy = tonumber(msg.Tags.AttackEnergy)

    -- get player coordinates
    local x = Players[player].x
    local y = Players[player].y

    -- check if player has enough energy to attack
    if Players[player].energy < attackEnergy then
        ao.send({Target = player, Action = "Attack-Failed", Reason = "Not enough energy."})
        return
    end

    -- update player energy and calculate damage
    Players[player].energy = Players[player].energy - attackEnergy
    local damage = math.floor((math.random() * 2 * attackEnergy) * (1/AverageMaxStrengthHitsToKill))

    announce("Attack", player .. " has launched a " .. damage .. " damage attack from " .. x .. "," .. y .. "!")

    -- check if any player is within range and update their status
    for target, state in pairs(Players) do
        if target ~= player and inRange(x, y, state.x, state.y, Range) then
            local newHealth = state.health - damage
            if newHealth <= 0 then
                eliminatePlayer(target, player)
            else
                Players[target].health = newHealth
                ao.send({Target = target, Action = "Hit", Damage = tostring(damage), Health = tostring(newHealth)})
                ao.send({Target = player, Action = "Successful-Hit", Recipient = target, Damage = tostring(damage), Health = tostring(newHealth)})
            end
        end
    end
end

-- Helper function to check if a target is within range
-- @param x1, y1: Coordinates of the attacker
-- @param x2, y2: Coordinates of the potential target
-- @param range: Attack range
-- @return Boolean indicating if the target is within range
function inRange(x1, y1, x2, y2, range)
    return x2 >= (x1 - range) and x2 <= (x1 + range) and y2 >= (y1 - range) and y2 <= (y1 + range)
end
```

The `attack` function calculates damage based on attack energy, checks player energy, and updates player health accordingly. Player attacks add the competitive element in your game, allowing players to engage with each other. The attacks are also announced to the players and listeners for real-time updates of the game.

### Handling the Logic

Lastly, you must setup handlers:

```lua
-- HANDLERS: Game state management for AO-Effect

-- Handler for player movement
Handlers.add("PlayerMove", { Action = "PlayerMove" }, move)

-- Handler for player attacks
Handlers.add("PlayerAttack", { Action = "PlayerAttack" }, attack)
```

As seen in earlier guides, the handlers help trigger functions when their respective patterns are met.

You can refer to the final code for `ao-effect.lua` in the dropdown below:

<details>
  <summary><strong>Final ao-effect.lua file</strong></summary>

```lua
-- AO EFFECT: Game Mechanics for AO Arena Game

-- Game grid dimensions
Width = 40 -- Width of the grid
Height = 40 -- Height of the grid
Range = 1 -- The distance for blast effect

-- Player energy settings
MaxEnergy = 100 -- Maximum energy a player can have
EnergyPerSec = 1 -- Energy gained per second

-- Attack settings
AverageMaxStrengthHitsToKill = 3 -- Average number of hits to eliminate a player

-- Initializes default player state
-- @return Table representing player's initial state
function playerInitState()
    return {
        x = math.random(0, Width),
        y = math.random(0, Height),
        health = 100,
        energy = 0
    }
end

-- Function to incrementally increase player's energy
-- Called periodically to update player energy
function onTick()
    if GameMode ~= "Playing" then return end  -- Only active during "Playing" state

    if LastTick == undefined then LastTick = Now end

    local Elapsed = Now - LastTick
    if Elapsed >= 1000 then  -- Actions performed every second
        for player, state in pairs(Players) do
            local newEnergy = math.floor(math.min(MaxEnergy, state.energy + (Elapsed * EnergyPerSec // 2000)))
            state.energy = newEnergy
        end
        LastTick = Now
    end
end

-- Handles player movement
-- @param msg: Message request sent by player with movement direction and player info
function move(msg)
    local playerToMove = msg.From
    local direction = msg.Tags.Direction

    local directionMap = {
        Up = {x = 0, y = -1}, Down = {x = 0, y = 1},
        Left = {x = -1, y = 0}, Right = {x = 1, y = 0},
        UpRight = {x = 1, y = -1}, UpLeft = {x = -1, y = -1},
        DownRight = {x = 1, y = 1}, DownLeft = {x = -1, y = 1}
    }

    -- calculate and update new coordinates
    if directionMap[direction] then
        local newX = Players[playerToMove].x + directionMap[direction].x
        local newY = Players[playerToMove].y + directionMap[direction].y

        -- updates player coordinates while checking for grid boundaries
        Players[playerToMove].x = (newX - 1) % Width + 1
        Players[playerToMove].y = (newY - 1) % Height + 1

        announce("Player-Moved", playerToMove .. " moved to " .. Players[playerToMove].x .. "," .. Players[playerToMove].y .. ".")
    else
        ao.send({Target = playerToMove, Action = "Move-Failed", Reason = "Invalid direction."})
    end
    onTick()  -- Optional: Update energy each move
end

-- Handles player attacks
-- @param msg: Message request sent by player with attack info and player state
function attack(msg)
    local player = msg.From
    local attackEnergy = tonumber(msg.Tags.AttackEnergy)

    -- get player coordinates
    local x = Players[player].x
    local y = Players[player].y

    -- check if player has enough energy to attack
    if Players[player].energy < attackEnergy then
        ao.send({Target = player, Action = "Attack-Failed", Reason = "Not enough energy."})
        return
    end

    -- update player energy and calculate damage
    Players[player].energy = Players[player].energy - attackEnergy
    local damage = math.floor((math.random() * 2 * attackEnergy) * (1/AverageMaxStrengthHitsToKill))

    announce("Attack", player .. " has launched a " .. damage .. " damage attack from " .. x .. "," .. y .. "!")

    -- check if any player is within range and update their status
    for target, state in pairs(Players) do
        if target ~= player and inRange(x, y, state.x, state.y, Range) then
            local newHealth = state.health - damage
            if newHealth <= 0 then
                eliminatePlayer(target, player)
            else
                Players[target].health = newHealth
                ao.send({Target = target, Action = "Hit", Damage = tostring(damage), Health = tostring(newHealth)})
                ao.send({Target = player, Action = "Successful-Hit", Recipient = target, Damage = tostring(damage), Health = tostring(newHealth)})
            end
        end
    end
end

-- Helper function to check if a target is within range
-- @param x1, y1: Coordinates of the attacker
-- @param x2, y2: Coordinates of the potential target
-- @param range: Attack range
-- @return Boolean indicating if the target is within range
function inRange(x1, y1, x2, y2, range)
    return x2 >= (x1 - range) and x2 <= (x1 + range) and y2 >= (y1 - range) and y2 <= (y1 + range)
end

-- HANDLERS: Game state management for AO-Effect

-- Handler for player movement
Handlers.add("PlayerMove", { Action = "PlayerMove" }, move)

-- Handler for player attacks
Handlers.add("PlayerAttack", { Action = "PlayerAttack" }, attack)
```

</details>

## Loading and Testing

Once you've written your game code, it's time to load it into the `aos` game process and test your game:

```lua
.load ao-effect.lua
```

> [!Important]
> Make sure to load the arena blueprint in the same process as well.

Invite friends or create test player processes to experience your game and make any necessary adjustments for optimal performance.

## What's Next

Congratulations! You've successfully expanded the arena by building your own game on top of its core functionalities. Armed with the knowledge and tools acquired in this guide, you're now equipped to build games on `aos` independently.

The possibilities are endless. Continue adding more features to existing games or create entirely new ones. The sky's the limit! ⌃◦🚀

```

## File: tutorials/bots-and-games/decisions.md
```
# Strategic Decisions

With the [latest game state](game-state) at your disposal, your bot can evolve into an `autonomous agent`. This transition marks an upgrade in functionality, enabling not just reactions to game states but strategic actions that consider context, energy, and proximity to make decisions.

## Writing the Code

Return to your `bot.lua` file and add the following functions:

```lua
-- Determines proximity between two points.
function inRange(x1, y1, x2, y2, range)
    return math.abs(x1 - x2) <= range and math.abs(y1 - y2) <= range
end

-- Strategically decides on the next move based on proximity and energy.
function decideNextAction()
  local player = LatestGameState.Players[ao.id]
  local targetInRange = false

  for target, state in pairs(LatestGameState.Players) do
      if target ~= ao.id and inRange(player.x, player.y, state.x, state.y, 1) then
          targetInRange = true
          break
      end
  end

  if player.energy > 5 and targetInRange then
    print("Player in range. Attacking.")
    ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(player.energy)})
  else
    print("No player in range or insufficient energy. Moving randomly.")
    local directionMap = {"Up", "Down", "Left", "Right", "UpRight", "UpLeft", "DownRight", "DownLeft"}
    local randomIndex = math.random(#directionMap)
    ao.send({Target = Game, Action = "PlayerMove", Player = ao.id, Direction = directionMap[randomIndex]})
  end
end
```

The `decideNextAction` function is now a testament to our agent's ability to think and act based on a comprehensive understanding of its environment. It analyzes the latest game state to either attack if you have sufficient energy and an opponent is `inRange` or move otherwise.

Now all you need is a handler to make sure this function runs on its own.

```lua
Handlers.add(
  "decideNextAction",
  { Action = "UpdatedGameState" },
  function ()
    if LatestGameState.GameMode ~= "Playing" then
      return
    end
    print("Deciding next action.")
    decideNextAction()
  end
)
```

This handler triggers upon receiving a message that the latest game state has been fetched and updated. An action is taken only when the game is in `Playing` mode.

You can refer to the latest code for `bot.lua` in the dropdown below:

<details>
  <summary><strong>Updated bot.lua file</strong></summary>

```lua
LatestGameState = LatestGameState or nil

function inRange(x1, y1, x2, y2, range)
    return math.abs(x1 - x2) <= range and math.abs(y1 - y2) <= range
end

function decideNextAction()
  local player = LatestGameState.Players[ao.id]
  local targetInRange = false

  for target, state in pairs(LatestGameState.Players) do
      if target ~= ao.id and inRange(player.x, player.y, state.x, state.y, 1) then
          targetInRange = true
          break
      end
  end

  if player.energy > 5 and targetInRange then
    print("Player in range. Attacking.")
    ao.send({Target = Game, Action = "PlayerAttack", Player = ao.id, AttackEnergy = tostring(player.energy)})
  else
    print("No player in range or insufficient energy. Moving randomly.")
    local directionMap = {"Up", "Down", "Left", "Right", "UpRight", "UpLeft", "DownRight", "DownLeft"}
    local randomIndex = math.random(#directionMap)
    ao.send({Target = Game, Action = "PlayerMove", Player = ao.id, Direction = directionMap[randomIndex]})
  end
end

Handlers.add(
"HandleAnnouncements",
{ Action = "Announcement" },
function (msg)
  ao.send({Target = Game, Action = "GetGameState"})
  print(msg.Event .. ": " .. msg.Data)
end
)

Handlers.add(
"UpdateGameState",
{ Action = "GameState" },
function (msg)
  local json = require("json")
  LatestGameState = json.decode(msg.Data)
  ao.send({Target = ao.id, Action = "UpdatedGameState"})
end
)

Handlers.add(
"decideNextAction",
{ Action = "UpdatedGameState" },
function ()
  if LatestGameState.GameMode ~= "Playing" then
    return
  end
  print("Deciding next action.")
  decideNextAction()
end
)
```

</details>

## Loading and Testing

Once again, to test out the latest upgrades, load the file in your aos player terminal as follows:

```lua
.load bot.lua
```

Observe your process output to see the decisions your autonomous agent makes in real-time, leveraging the current game state for strategic advantage. But what if another player attacks you and runs away while you are deciding the next move? In the next section you'll learn to automatically counter as soon as you have been attacked 🤺

```

## File: tutorials/bots-and-games/game-state.md
```
# Fetching Game State

Now that you're seeing game announcements directly in your terminal, you have a better grasp of the game's dynamics. However, these insights are limited to specific actions occurring within the game.

Wouldn't it be more useful to have on-demand access to comprehensive game data, like the positions, health, and energy of all players? This information could significantly improve your strategic planning, helping you assess threats, opportunities, and timing more effectively.

If you thought of adding another handler to the bot created in the [previous guide](announcements), you're absolutely right!

## Writing the Code

Go back to your `bot.lua` file and update your existing handler as follows:

```lua
Handlers.add(
  "HandleAnnouncements",
  { Action = "Announcement" },
  function (msg)
    ao.send({Target = Game, Action = "GetGameState"})
    print(msg.Event .. ": " .. msg.Data)
  end
)
```

Adjustments to your handler include:

- Renaming to `"HandleAnnouncements"` to reflect its broader role.
- Addition of an extra operation to request the game for the updated state. The game is designed to respond to the `GetGameState` action tag.

When you get a print of the announcement, you can check the latest message in your `Inbox` as follows:

```lua
Inbox[#Inbox]
```

The `Data` field of this message contains the latest state of the game which includes:

- `GameMode` : Whether the game is in `Waiting` or `Playing` state.
- `TimeRemaining` : The time remaining for the game to start or end.
- `Players` : A table containing every player's stats like position, health and energy.

But this can be taken a step further so that you can not just read but also use information from the latest state for other automations.

Let's define a new variable that stores the latest state as follows:

```lua
LatestGameState = LatestGameState or nil
```

The syntax preserves existing values of the variable when you load successive iterations of the `bot.lua` file in your terminal, instead of overwriting it. If there is no pre-existing value then a `nil` value is assigned to the variable.

Then implement another handler as follows:

```lua
-- Handler to update the game state upon receiving game state information.
Handlers.add(
  "UpdateGameState",
  { Action = "Announcement" },
  function (msg)
    local json = require("json")
    LatestGameState = json.decode(msg.Data)
    ao.send({Target = ao.id, Action = "UpdatedGameState"})
    print("Game state updated. Print \'LatestGameState\' for detailed view.")
  end
)
```

The response from the game process from the previous handler has an action tag with the value `GameState` that helps us trigger this second handler. Once triggered, the handle function loads the in-built `json` package that parses the data into json and stores it in the `LatestGameState` variable.

This handler additionally sends a message to your process indicating when the state has been updated. The significance of this feature will be explained in the following section.

You can refer to the latest code for `bot.lua` in the dropdown below:

<details>
  <summary><strong>Updated bot.lua file</strong></summary>

```lua
LatestGameState = LatestGameState or nil

Handlers.add(
"HandleAnnouncements",
{ Action = "Announcement" },
function (msg)
  ao.send({Target = Game, Action = "GetGameState"})
  print(msg.Event .. ": " .. msg.Data)
end
)

Handlers.add(
"UpdateGameState",
{ Action = "GameState" },
function (msg)
  local json = require("json")
  LatestGameState = json.decode(msg.Data)
  ao.send({Target = ao.id, Action = "UpdatedGameState"})
  print("Game state updated. Print \'LatestGameState\' for detailed view.")
end
)
```

</details>

## Loading and Testing

As usual, to test this new feature, load the file in your aos player terminal as follows:

```lua
.load bot.lua
```

Then check the `LatestStateVariable` to see if it has updated correctly by simply passing its name as follows:

```lua
LatestGameState
```

With real-time access to the latest state of the game you bot is equipped to make informed decisions decide your next action. Next let's try automating actions with the help of this data 🚶

```

## File: tutorials/bots-and-games/index.md
```
---
prev:
  text: "Tokengating"
  link: "../begin/tokengating"
next:
  text: "Let's Play A Game!"
  link: "./ao-effect"
---

# Bots and Games
> [!NOTE]  
> Build your own unique bot to complete Quest 3 and earn 1000 CRED, then enter games like the [Grid](https://github.com/twilson63/grid) to earn testnet CRED 24/7!

Leveraging insights from our previous chapter, this section will guide you through the realm of automation with bots in aos and the construction of games. You will learn to create autonomous agents, using them to navigate and interact with game environments effectively.

## Sections

### Getting Started with a Game

- [0. **# Let's Play A Game:** _Experience a game on aos_](ao-effect)

### Enhancing Game Interactions with Automation

- [1. **# Interpreting Announcements:** _Interpret in-game announcements_](announcements)
- [2. **# Fetching Game State:** _Retrieve and process the latest game state_](game-state)
- [3. **# Strategic Decisions:** _Utilize automation to determine your next move_](decisions)
- [4. **# Automated Responses:** _Streamline attack responses through automation_](attacking)
- [5. **# Bringing it Together:** _Combine your skills to craft an autonomous agent_](bringing-together)

### Game Development Insights

- [6. **# Mechanics of the Arena:** _Explore the underlying mechanics of a game's arena_](arena-mechanics)
- [7. **# Expanding the Arena:** _Build unique game logic upon the arena_](build-game)

A journey of discovery and creation awaits. Let the adventure begin!

```

## File: tutorials/index.md
```
---
prev:
  text: "Testnet Info"
  link: "/welcome/testnet-info"
next:
  text: "Begin"
  link: "./begin/index"
---

# Tutorials

Here, we've created a series of tutorials to help you get started with aos and build your first processes. These tutorials include interactive guides, code snippets, and examples to help you get comfortable with the aos environment.

## List of Tutorials

- [Getting Started - An Interactive Guide](begin/index)

- [Bots and Games](bots-and-games/index)

```

## File: welcome/getting-started.md
```
# Get started in 5 minutes

In less than 5 mins, we'll walk you through the process of taking your first peek into the rabbit hole. 🕳️🐇

## System requirements

The local client of aos is super simple to install. Just make sure you have:

- [NodeJS](https://nodejs.org) version 20+. (If you haven't yet installed it, check out [this page](https://nodejs.org/en/download/package-manager) to find instructions for your OS).
- A code editor of your choice.

## Installing aos

Once you have NodeJS on your machine, all you need to do is install aos and run it:

```sh
npm i -g https://get_ao.g8way.io
```

After installation, we can simply run the command itself to start a new aos process!

```sh
aos
```

You authenticate yourself to your aos process using a keyfile. If you have an Arweave wallet you can specify it by adding a `--wallet [location]` flag. If you don't, a new keyfile will be generated and stored locally for you at `~/.aos.json`.

## Welcome to the rabbit hole

The utility you just started is a local client, which is ready to relay messages for you to your new process inside the ao computer.

After it connects, you should see the following:

```lua
          _____                   _______                   _____
         /\    \                 /::\    \                 /\    \
        /::\    \               /::::\    \               /::\    \
       /::::\    \             /::::::\    \             /::::\    \
      /::::::\    \           /::::::::\    \           /::::::\    \
     /:::/\:::\    \         /:::/~~\:::\    \         /:::/\:::\    \
    /:::/__\:::\    \       /:::/    \:::\    \       /:::/__\:::\    \
   /::::\   \:::\    \     /:::/    / \:::\    \      \:::\   \:::\    \
  /::::::\   \:::\    \   /:::/____/   \:::\____\   ___\:::\   \:::\    \
 /:::/\:::\   \:::\    \ |:::|    |     |:::|    | /\   \:::\   \:::\    \
/:::/  \:::\   \:::\____\|:::|____|     |:::|    |/::\   \:::\   \:::\____\
\::/    \:::\  /:::/    / \:::\    \   /:::/    / \:::\   \:::\   \::/    /
 \/____/ \:::\/:::/    /   \:::\    \ /:::/    /   \:::\   \:::\   \/____/
          \::::::/    /     \:::\    /:::/    /     \:::\   \:::\    \
           \::::/    /       \:::\__/:::/    /       \:::\   \:::\____\
           /:::/    /         \::::::::/    /         \:::\  /:::/    /
          /:::/    /           \::::::/    /           \:::\/:::/    /
         /:::/    /             \::::/    /             \::::::/    /
        /:::/    /               \::/____/               \::::/    /
        \::/    /                 ~~                      \::/    /
         \/____/                                           \/____/

Welcome to AOS: Your operating system for AO, the decentralized open
access supercomputer.

Type ".load-blueprint chat" to join the community chat and ask questions!

AOS Client Version: 1.12.1. 2024
Type "Ctrl-C" twice to exit

Your AOS process:  QFt5SR6UwJSCnmgnROq62-W8KGY9z96k1oExgn4uAzk

default@aos-0.2.2[Inbox:1]>
```

Welcome to your new home in the ao computer! The prompt you are now looking at is your own personal server in this decentralized machine. We will be using it to play with and explore ao in the rest of this tutorial.

## Sending your first command

Your new personal aos process is a server that lives inside the computer, waiting to receive and execute your commands.

aos loves to make things simple, so it wants to hear commands from you in the Lua programming language. Don't know Lua? Don't panic! It is a super straightforward, friendly, and fun language. We will learn it as we progress through this series.

Let's break the ice and type:

```lua
aos> "Hello, ao!"
```

Then hit the "[Enter]" key. You should see your shell sign and post the message, request the result, then print the result as follows:

```lua
"Hello, ao!"
```

## Eh. What's the big deal?

Sent it a message to your process, permanently etched it into Arweave, then asked a distributed compute network to calculate its result.

While the result might not _look_ revolutionary, in reality you have done something quite extraordinary. Your process is a _decentralized_ server that doesn't exist in any one particular place on Earth. It exists as data, replicated on Arweave between many different machines, distributed all over the world. If you wanted to, you could now attach a new compute unit to this process and recreate the state from its log of inputs (just your single command, for now) -- at any time in the future.

This makes your new shell process...

- **Resilient**: There is no single place on Earth where your server actually resides. It is everywhere and nowhere -- immune from physical destruction or tampering of any kind.
- **Permanent**: Your process will never disappear. It will always exist in its [✨holographic state✨ ](/concepts/holographic-state) on Arweave, allowing you to recall it and continue playing with it. A contribution has been made to Arweave's storage endowment, so that you never have to think about upkeep or maintenance payments again.
- **Permissionless**: You did not have to register in order to start this server. Your right to use it is guaranteed by its underlying protocol (Arweave), no matter what Google, Amazon, or any other BigTech company says.
- **Trustless**: The state of your server is _mathematically guaranteed_. This means that you -- and everyone else -- can trust it with certainty, without even having to trust the underlying hardware it runs on. This property lets you build trustless _services_ on top: Code that runs without any privileged owner or controller, ruled purely by math.

There is so much more to it, but these are the basics. Welcome to the ao computer, newbie! We are grateful to have you. 🫡

## Next Steps

In the tutorials that follow, we will explore ao and build everything from chatrooms to autonomous, decentralized bots. Let's go!

```

## File: welcome/index.md
```
---
next:
  text: "Getting Started"
  link: "./getting-started"
---

# Welcome to ao

![ao logo](/ao-logo-grey.svg)

The ao computer is a world where countless parallel processes interact within a single, cohesive computing environment, seamlessly interlinked through a native message-passing layer. It is a burgeoning ecosystem of decentralized programs, akin to the World Wide Web, where each process, like a website, operates independently yet is intricately woven into a unified experience.

## ao + aos: The rocket and your rocket fuel.

Typically when you use ao, you will interact with it through its operating system: `aos`.

aos is an abstraction layer that runs in your processes, making it easy to use the full functionality of the ao computer. In this cookbook, you will learn everything you need to know about getting started with the ao computer using aos.

## Paper


If you would like to learn more about the technical specifications of ao, please check out its [spec](https://ao.g8way.io/#/read) for detailed analysis.

## Next Steps

In the tutorials that follow, we will explore ao and build everything from chatrooms to autonomous, decentralized bots.

Let's jump into it! 🚀

```

## File: welcome/testnet-info/index.md
```
---
prev:
  text: "Welcome"
  link: "../index"
next:
  text: "Begin"
  link: "/tutorials/begin/index"
---

# Get involved with the ao testnet

On February 27, 2024, `ao` Testnet was launched, for developers and early adopters to explore the hyper parallel computer.

## What is the ao testnet?

The `ao` testnet is setup to allow users to interact with the `ao` computer without fees, to test and build towards mainnet.

The best way to get involved is to build and use the `ao` computer with the `aos` console.
In the `Things to do` section below you will find many activities to try.

## Installing the aos client

Once you have [NodeJS](https://nodejs.org) on your machine, all you need to do is install `aos` and run it:

```sh
$ npm i -g https://get_ao.g8way.io
```

Running this command at a later date will upgrade `aos` to the latest version.
After installation, we can simply run the command itself to start a new `aos` process:

```sh
$ aos
```

This will start a process named `default`. See [the aos guide](/guides/aos/index) for more details.

## First steps in the ao testnet

Follow the tutorials and learn to build on `ao`. [Begin](/tutorials/begin/index)

## Joining ao's native community chat

The ao network hosts a number of chat servers that allow you to converse with other devs,
right from your `aos` console. To load the chat client run the following:

```lua
aos> .load-blueprint chat
```

To show the available rooms you can run:

```lua
aos> List()
```

You can join a room and start chatting with other devs as follows:

```lua
aos> Join("Getting-Started", "yourName")
aos> Say("Hi")
```

```

## File: welcome/testnet-info/quests.md
```
# Quests FAQ

::: info

The `ao` ecosystem is in a very early stage and full of opportunity.
There is a community quest board full of ways that you can get involved testing and building
software to grow the ecosystem, all while earning its native currency: CRED.

:::

## Video Tutorial

<iframe width="680" height="350" src="https://www.youtube.com/embed/QA3OmkLcdRs?si=CLAZrIUhJ0aEGYxM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## What quests are available?

There is a dev chat room within `ao` localnet which you can query for quest information.
First, launch `aos`:

```sh
$ aos
```

Next, join the `Quests` chatroom, if you haven't done so already. You can optionally provide your
screenname/handle as the second parameter

```lua
aos> Join("Quests")
# OR
aos> Join("Quests", "MyScreenName")
```

Then you can send the `/Quests` slash command to that chatroom. In case you have joined multiple
chatrooms, the second parameter sends the message to only one specific chatroom, by name.

```lua
aos> Say("/Quests")
# OR
aos> Say("/Quests", "Quests")
```

After a few seconds, a bot will respond by broadcasting the list of available quests to the chatroom.

## How do I view the detailed quest description?

You can learn more about the details of a specific quest, by sending a `/Quests:[index]` slash
command into the `Quests` chatroom, where `[index]` should be replaced with the quest number, for example:

```lua
aos> Say("/Quests:1", "Quests")
# OR
aos> Say("/Quests:2", "Quests")
```

### Quest 1: "Begin"

The detailed steps for Quest 1 are available in the [Begin](/tutorials/begin/index) tutorial in this cookbook.

### Quest 2: "Bots-and-Games"

The detailed steps for Quest 2 are available in the [Bots and Games](/tutorials/bots-and-games/index) tutorial in this cookbook.

## How do I complete a quest?

Follow _all_ the steps in the quest description, including submitting the claim.

```

