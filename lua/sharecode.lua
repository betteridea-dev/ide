-- LUA code that handles the share code feature of BetterIDEa.
-- The _BETTERIDEA_SHARE variable is set to a base64 encoded string of the project data json.
-- The handler Get-Better-IDEa-Share is dryrun and loaded into the IDE by upon visiting the share code link.

_BETTERIDEA_SHARE = 'BASE64_ENCODED_STRING_OF_THE_PROJECT_DATA_JSON'

Handlers.add(
    "Get-Better-IDEa-Share",
    Handlers.utils.hasMatchingTag("Action", "Get-BetterIDEa-Share"),
    function(msg)
        ao.send({ Target = msg.From, Action = "BetterIDEa-Share-Response", Data = _BETTERIDEA_SHARE })
        return _BETTERIDEA_SHARE
    end
)
