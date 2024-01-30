-- we are using json.encode to convert lua list to js list
local json = require("json")

-- Initialise a table to store share data and analytics
if not Betteridea then
    Betteridea = {
        Code = {},
        AccessedBy = {},
        LastUpdated = os.time(os.date("!*t"))
    }
end


-- This handler checks for a message with the tag Action=GetCode
-- and replies with the list of that was shared by the process owner
Handlers.add(
    "GetCode",
    Handlers.utils.hasMatchingTag("Action","GetCode"),
    function(msg)
        accessed_by = Betteridea.AccessedBy[msg.From]
        if not accessed_by then
            Betteridea.AccessedBy[msg.From] = {
                Count=1,
                Latest=os.time(os.date("!*t"))
            }
        else
            Betteridea.AccessedBy[msg.From] = {
                Count = accessed_by.Count+1,
                Latest=os.time(os.date("!*t"))
            }
        end
        Handlers.utils.reply(json.encode(Betteridea.Code))(msg)
    end
)

-- To check if the handler works
-- message the process to get its shared code (only possible if the process has shared its code)
-- an array of strings is send in the reply Data field
ao.send({Target=ao.id, Tags={Action="GetCode"}})

-- To check the code list returned by the handler
Inbox[#Inbox].Data

-- https://ide.betteridea.dev/?getcode=<PROCESS_ID>
-- Share this url with them after clicking on the share button