export const name = `Test`
export const src = `
local Test = {}
Test.__index = Test

function Test.new(name)
    local self = setmetatable({}, Test)
    self.name = name
    self.tests = {}
    return self
end

function Test:add(name, func)
    table.insert(self.tests, { name = name, func = func })
end

function Test:run()
    local output = ""
    local out = function (txt)
      output = output .. txt .. '\\n'
    end
    out("Running tests for " .. self.name)
    local passed = 0
    local failed = 0
    for _, test in ipairs(self.tests) do
        local status, err = pcall(test.func)
        if status then
            out("✔ " .. test.name)
            passed = passed + 1
        else
            out("✘ " .. test.name .. ": " .. err)
            failed = failed + 1
        end
    end
    out(string.format("Passed: %d, Failed: %d", passed, failed))
    return output
end

return Test
`