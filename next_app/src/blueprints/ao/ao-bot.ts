export const source = `-- Initializing global variables to store the latest game state and game host process.
LatestGameState = LatestGameState or nil
Counter = Counter or 0

colors = {
  red = "\\27[31m",
  green = "\\27[32m",
  blue = "\\27[34m",
  reset = "\\27[0m",
  gray = "\\27[90m"
}

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

  if player.energy > 10 and targetInRange then
    print(colors.red .. "Player in range. Attacking..." .. colors.reset)
    ao.send({Target = Game, Action = "PlayerAttack", AttackEnergy = tostring(player.energy)})
  else
    -- print(colors.red .. "No player in range or insufficient energy. Moving randomly." .. colors.reset)
    local directionMap = {"Up", "Down", "Left", "Right", "UpRight", "UpLeft", "DownRight", "DownLeft"}
    local randomIndex = math.random(#directionMap)
    ao.send({Target = Game, Action = "PlayerMove", Direction = directionMap[randomIndex]})
  end
end

-- Handler to print game announcements and trigger game state updates.
Handlers.add(
  "PrintAnnouncements",
  Handlers.utils.hasMatchingTag("Action", "Announcement"),
  function (msg)
    ao.send({Target = Game, Action = "GetGameState"})
    print(colors.green .. msg.Event .. ": " .. msg.Data .. colors.reset)
    print("Location: " .. "row: " .. LatestGameState.Players[ao.id].x .. ' col: ' .. LatestGameState.Players[ao.id].y)

  end
)

-- Handler to trigger game state updates.
Handlers.add(
  "GetGameStateOnTick",
  Handlers.utils.hasMatchingTag("Action", "Tick"),
  function ()
      -- print(colors.gray .. "Getting game state..." .. colors.reset)
      ao.send({Target = Game, Action = "GetGameState"})
  end
)

-- Handler to update the game state upon receiving game state information.
Handlers.add(
  "UpdateGameState",
  Handlers.utils.hasMatchingTag("Action", "GameState"),
  function (msg)
    local json = require("json")
    LatestGameState = json.decode(msg.Data)
    ao.send({Target = ao.id, Action = "UpdatedGameState"})
    --print("Game state updated. Print \'LatestGameState\' for detailed view.")
    print("Location: " .. "row: " .. LatestGameState.Players[ao.id].x .. ' col: ' .. LatestGameState.Players[ao.id].y)
  end
)

-- Handler to decide the next best action.
Handlers.add(
  "decideNextAction",
  Handlers.utils.hasMatchingTag("Action", "UpdatedGameState"),
  function ()
    --print("Deciding next action...")
    decideNextAction()
    ao.send({Target = ao.id, Action = "Tick"})
  end
)

-- Handler to automatically attack when hit by another player.
Handlers.add(
  "ReturnAttack",
  Handlers.utils.hasMatchingTag("Action", "Hit"),
  function (msg)
    local playerEnergy = LatestGameState.Players[ao.id].energy
    if playerEnergy == undefined then
      print(colors.red .. "Unable to read energy." .. colors.reset)
      ao.send({Target = Game, Action = "Attack-Failed", Reason = "Unable to read energy."})
    elseif playerEnergy > 10 then
      print(colors.red .. "Player has insufficient energy." .. colors.reset)
      ao.send({Target = Game, Action = "Attack-Failed", Reason = "Player has no energy."})
    else
      print(colors.red .. "Returning attack..." .. colors.reset)
      ao.send({Target = Game, Action = "PlayerAttack", AttackEnergy = tostring(playerEnergy)})
    end
    ao.send({Target = ao.id, Action = "Tick"})
  end
)

Handlers.add(
  "ReSpawn",
  Handlers.utils.hasMatchingTag("Action", "Eliminated"),
  function (msg)
    Send({Target = CRED, Action = "Transfer", Quantity = "1000", Recipient = Game})
  end
)

Handlers.add(
  "StartTick",
  Handlers.utils.hasMatchingTag("Action", "Payment-Received"),
  function (msg)
    Send({Target = Game, Action = "GetGameState", Name = Name, Owner = Owner })
    print('Start Moooooving!')
  end
)

Prompt = function () return Name .. "> " end`