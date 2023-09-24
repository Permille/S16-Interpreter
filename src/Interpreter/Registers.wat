(module
  (memory 1)
  (func (export "GetRegister") (param $RegisterID i32) (result i32)
    local.get $RegisterID
    i32.eqz
    if
      i32.const 0
      return
    end
    local.get $RegisterID
    i32.const 1
    i32.shl
    i32.load16_u
  )
  (func (export "SetRegister") (param $Value i32) (param $RegisterID i32)
    local.get $RegisterID
    i32.eqz
    if
      return
    end
    local.get $RegisterID
    i32.const 1
    i32.shl
    local.get $Value
    i32.store16
  )
)