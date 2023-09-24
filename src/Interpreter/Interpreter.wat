(module
  (import "Main" "Memory" (memory 0 65535))
  (import "Main" "GetRegister" (func $GetRegister (param i32) (result i32)))
  (import "Main" "SetRegister" (func $SetRegister (param i32) (param i32)))
  (global $InstructionAddress (export "InstructionAddress") (mut i32) (i32.const 0))
  (global $ErrorState (export "ErrorState") (mut i32) (i32.const 0))
  (global $InstructionsExecuted (export "InstructionsExecuted") (mut i32) (i32.const 0))
  (func (export "Reset")
    (local $i i32)
    i32.const 0
    global.set $InstructionAddress
    i32.const 0
    global.set $ErrorState
    i32.const 0
    global.set $InstructionsExecuted

    loop
      i32.const 5
      local.get $i
      call $SetRegister

      local.get $i
      i32.const 1
      i32.add
      local.tee $i
      i32.const 16
      i32.lt_s
      br_if 0
    end
  )
  (func (export "Run") (param $MaxIterations i32)
    (local $b i32)
    (local $a i32)
    (local $d i32)
    (local $Code i32)
    (local $Instruction i32)
    loop $MainLoop
      global.get $InstructionAddress
      i32.load16_u

      local.tee $Instruction
      i32.const 12
      i32.shr_u
      local.set $Code

      local.get $Instruction
      i32.const 8
      i32.shr_u
      i32.const 15
      i32.and
      local.set $d

      local.get $Instruction
      i32.const 4
      i32.shr_u
      i32.const 15
      i32.and
      local.set $a

      local.get $Instruction
      i32.const 15
      i32.and
      local.set $b

      block $BreakSwitch
        block block block block block block block block block block block block block block block block
          local.get $Code
          br_table 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
        end
          unreachable ;; add
        end
          unreachable ;; sub
        end
          ;; mul
          local.get $d
          local.get $a
          local.get $b
          call $I:mul
          br $BreakSwitch
        end
          unreachable ;; div
        end
          unreachable ;; cmp
        end
          unreachable ;; addc
        end
          unreachable ;; muln
        end
          unreachable ;; divn
        end
          unreachable ;; no-op (0x8)
        end
          unreachable ;; no-op (0x9)
        end
          unreachable ;; no-op (0xa)
        end
          unreachable ;; no-op (0xb)
        end
          unreachable ;; trap
        end
          unreachable ;; no-op (0xd)
        end
          unreachable ;; EXP (0xe)
        end
        unreachable ;; RX (0xf)
      end

      ;; Increments the instruction address, this will need to be replaced later.
      global.get $InstructionAddress
      i32.const 2
      i32.add
      global.set $InstructionAddress


      local.get $MaxIterations
      i32.const 1
      i32.sub
      local.tee $MaxIterations
      br_if $MainLoop
    end
  )
  ;; Instruction implementations
  (func $I:mul
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $p i32)
    local.get $RegisterA
    call $GetRegister
    local.get $RegisterB
    call $GetRegister
    i32.mul
    local.tee $p
    i32.const 32767
    i32.gt_s
    local.get $p
    i32.const -32768
    i32.lt_s
    i32.or
    i32.const 5 ;; Bit for `ccv` (signed overflow)
    i32.shl
    i32.const 15 ;; Control register R15
    call $SetRegister
    local.get $p
    local.get $Destination
    call $SetRegister ;; No need to convert to i16 because SetRegister does that
  )
)