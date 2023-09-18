(module
  (import "Main" "Memory" (memory 0 65535))
  (func (export "Main") (param $i i32) (result i32)
    local.get $i
    i32.const 12345
    i32.add
  )
)