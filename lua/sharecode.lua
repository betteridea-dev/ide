local json = require("json")

-- table to store info
if not Betteridea then
    Betteridea = {
        Code = {"1+41"},
        AccessedBy = {},
        LastUpdated = os.time(os.date("!*t"))
    }
end


-- If someone wasnts to share their notebook code
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

-- message the process to get its shared code (only possible if the process has shared its code)
-- an array of strings is send in the reply Data field
ao.send({Target=ao.id, Tags={Action="GetCode"}})

-- https://ide.betteridea.dev/?getcode=<PROCESS_ID>
-- Share this url with them after clicking on the share button