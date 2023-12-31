(module
  (import "Main" "Memory" (memory 3 3))
  (global $InstructionAddress (export "InstructionAddress") (mut i32) (i32.const 0))
  (global $ErrorState (export "ErrorState") (mut i32) (i32.const 0))
  (global $InstructionsExecuted (export "InstructionsExecuted") (mut i32) (i32.const 0))

  (func $GetInstructionAddress (export "GetInstructionAddress") (result i32) global.get $InstructionAddress i32.const 1 i32.shr_u)
  
  (func $GetRegister (export "GetRegister") (param $RegisterID i32) (result i32)
    ;;local.get $RegisterID
    ;;i32.eqz
    ;;if i32.const 0 return end
    i32.const 0
    i32.const 0
    i32.store16 offset=1024
    
    local.get $RegisterID
    i32.const 1
    i32.shl
    i32.load16_u offset=1024
  )
  (func $SetRegister (export "SetRegister") (param $Value i32) (param $RegisterID i32)
    local.get $RegisterID
    i32.eqz
    if return end
    local.get $RegisterID
    i32.const 1
    i32.shl
    local.get $Value
    i32.store16 offset=1024
  )
  (func (export "Reset")
    (local $i i32)
    i32.const 0
    global.set $InstructionAddress
    i32.const 0
    global.set $ErrorState
    i32.const 0
    global.set $InstructionsExecuted

    loop
      i32.const 0
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
    i32.const 65536
    i32.const 0
    i32.const 131072
    memory.fill
  )
  (func (export "Run") (param $MaxIterations i32) (result i32)
    (local $b i32)
    (local $a i32)
    (local $d i32)
    (local $Code i32)
    (local $FirstByte i32)
    (local $SecondByte i32)
    (local $SecondWord i32)
    loop $MainLoop
      global.get $InstructionAddress
      i32.load8_u offset=65537

      local.tee $SecondByte
      i32.const 4
      i32.shr_u
      local.set $Code

      local.get $SecondByte
      i32.const 15
      i32.and
      local.set $d

      global.get $InstructionAddress
      i32.load8_u offset=65536

      local.tee $FirstByte
      i32.const 4
      i32.shr_u
      local.set $a

      local.get $FirstByte
      i32.const 15
      i32.and
      local.set $b

      global.get $InstructionAddress
      i32.const 2 ;;This is in bytes, so it increments by 1 word
      i32.add
      global.set $InstructionAddress

      block $Exit block block block block block block block block block block block block block block block block
        local.get $Code
        br_table 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
      end
        ;; add
        local.get $d
        local.get $a
        local.get $b
        call $I:add
        br $Exit
      end
        ;; sub
        local.get $d
        local.get $a
        local.get $b
        call $I:sub
        br $Exit
      end
        ;; mul
        local.get $d
        local.get $a
        local.get $b
        call $I:mul
        br $Exit
      end
        ;; div
        local.get $d
        local.get $a
        local.get $b
        call $I:div
        br $Exit
      end
        ;; cmp
        local.get $a
        local.get $b
        call $I:cmp
        br $Exit
      end
        ;; addc
        local.get $d
        local.get $a
        local.get $b
        call $I:addc
        br $Exit
      end
        ;; muln
        local.get $d
        local.get $a
        local.get $b
        call $I:muln
        br $Exit
      end
        ;; divn
        local.get $d
        local.get $a
        local.get $b
        call $I:divn
        br $Exit
      end
        nop ;; no-op (0x8)
        br $Exit
      end
        nop ;; no-op (0x9)
        br $Exit
      end
        nop ;; no-op (0xa)
        br $Exit
      end
        nop ;; no-op (0xb)
        br $Exit
      end
        ;; trap
        block block block block block block block
          local.get $d
          call $GetRegister
          br_table 0 1 2 3 4 5
        end
          ;; 0: Stop execution
          i32.const 1
          return
        end
          ;; 1: Read
          unreachable
        end
          ;; 2: Write
          unreachable
        end
          ;; 3: Blocking read, not implemented, nop
          nop
          br $Exit
        end
          ;; 4: Breakpoint
          i32.const 2
          return
        end
          ;; Do nothing
          nop
        end
      end
        nop ;; no-op (0xd)
        br $Exit
      end
        ;; EXP (0xe)
        global.get $InstructionAddress
        i32.load16_u offset=65536 ;;TODO: Handle case when InstructionAddress is out of bounds
        local.set $SecondWord

        global.get $InstructionAddress
        i32.const 2 ;;This is in bytes, so it increments by 1 word
        i32.add
        global.set $InstructionAddress
        block block block block block block block
        block block block block block block block
        block block block block block block block
        block block block block block block block
          local.get $FirstByte
          br_table 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26
        end
          ;;0x00 brf
          br $Exit
        end
          ;;0x01 brb
          br $Exit
        end
          ;;0x02 brfc0
          br $Exit
        end
          ;;0x03 brbc0
          br $Exit
        end
          ;;0x04 brfc1
          br $Exit
        end
          ;;0x05 brbc1
          br $Exit
        end
          ;;0x06 brfz
          br $Exit
        end
          ;;0x07 brbz
          br $Exit
        end
          ;;0x08 brfbz
          br $Exit
        end
          ;;0x09 brbnz
          br $Exit
        end
          ;;0x0a dsptch
          br $Exit
        end
          ;;0x0b save
          br $Exit
        end
          ;;0x0c restor
          br $Exit
        end
          ;;0x0d push
          br $Exit
        end
          ;;0x0e pop
          br $Exit
        end
          ;;0x0f top
          br $Exit
        end
          ;;0x10 shiftl
          br $Exit
        end
          ;;0x11 shiftr
          br $Exit
        end
          ;;0x12 logicw
          br $Exit
        end
          ;;0x13 logicb
          br $Exit
        end
          ;;0x14 logicc
          br $Exit
        end
          ;;0x15 extrc
          br $Exit
        end
          ;;0x16 extrci
          br $Exit
        end
          ;;0x17 getctl
          br $Exit
        end
          ;;0x18 putctl
          br $Exit
        end
          ;;0x19 resume
          br $Exit
        end
          ;;>=0x1a noop
          br $Exit
        end
      end
        ;; RX (0xf)
        global.get $InstructionAddress
        i32.load16_u offset=65536 ;;TODO: Handle case when InstructionAddress is out of bounds
        local.set $SecondWord

        global.get $InstructionAddress
        i32.const 2 ;;This is in bytes, so it increments by 1 word
        i32.add
        global.set $InstructionAddress
        block block block block block block block block block block block block block block block block block
          local.get $b
          br_table 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
        end
          ;; lea (0xf__0)
          local.get $d
          local.get $a
          local.get $SecondWord
          call $I:lea
          br $Exit
        end
          ;; load (0xf__1)
          local.get $d
          local.get $a
          local.get $SecondWord
          call $I:load
          br $Exit
        end
          ;; store (0xf__2)
          local.get $d
          local.get $a
          local.get $SecondWord
          call $I:store
          br $Exit
        end
          ;; jump (0xf__3)
          local.get $d
          local.get $SecondWord
          call $I:jump
          br $Exit
        end
          ;; jumpc0 (0xf__4)
          local.get $d
          local.get $a
          local.get $SecondWord
          call $I:jumpc0
          br $Exit
        end
          ;; jumpc1 (0xf__5)
          local.get $d
          local.get $a
          local.get $SecondWord
          call $I:jumpc1
          br $Exit
        end
          ;; jal (0xf__6)
          local.get $d
          local.get $a
          local.get $SecondWord
          call $I:jal
          br $Exit
        end
          ;; no-op (0xf__7)
          nop
          br $Exit
        end
          ;; no-op (0xf__8)
          nop
          br $Exit
        end
          ;; no-op (0xf__9)
          nop
          br $Exit
        end
          ;; no-op (0xf__a)
          nop
          br $Exit
        end
          ;; tstset (0xf__b)
          ;; The original implementation doesn't work, so it's effectively a no-op.
          nop
          br $Exit
        end
          ;; no-op (0xf__c)
          nop
          br $Exit
        end
          ;; no-op (0xf__d)
          nop
          br $Exit
        end
          ;; no-op (0xf__e)
          nop
          br $Exit
        end
          ;; no-op (0xf__f)
          nop
          br $Exit
        end
      end ;; Exit

      local.get $MaxIterations
      i32.const 1
      i32.sub
      local.tee $MaxIterations
      br_if $MainLoop
    end
    i32.const 0
  )
  ;; Instruction implementations
  (func $I:lea
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister
    local.get $ImmediateOffset
    i32.add
    local.get $Destination
    call $SetRegister
  )
  (func $I:load
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister
    local.get $ImmediateOffset
    i32.add
    i32.const 65535
    i32.and
    i32.const 1
    i32.shl
    i32.load16_u offset=65536
    local.get $Destination
    call $SetRegister
  )
  (func $I:store
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister
    local.get $ImmediateOffset
    i32.add
    i32.const 65535
    i32.and
    i32.const 1
    i32.shl
    local.get $Destination
    call $GetRegister
    i32.store16 offset=65536
  )
  (func $I:jump
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister
    local.get $ImmediateOffset
    i32.add
    i32.const 1
    i32.shl
    global.set $InstructionAddress
  )
  (func $I:jumpc0
    (param $Bit i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    i32.const 15
    call $GetRegister
    local.get $Bit
    i32.shr_u
    i32.const 1
    i32.and
    if return end
    local.get $Parameter
    call $GetRegister
    local.get $ImmediateOffset
    i32.add
    i32.const 1
    i32.shl
    global.set $InstructionAddress
  )
  (func $I:jumpc1
    (param $Bit i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    i32.const 15
    call $GetRegister
    local.get $Bit
    i32.shr_u
    i32.const 1
    i32.and
    if
      local.get $Parameter
      call $GetRegister
      local.get $ImmediateOffset
      i32.add
      i32.const 1
      i32.shl
      global.set $InstructionAddress
    end
  )
  (func $I:jal
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister
    global.get $InstructionAddress
    local.get $Destination
    call $SetRegister
    local.get $ImmediateOffset
    i32.add
    i32.const 1
    i32.shl
    global.set $InstructionAddress
  )
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
    local.set $p
    
    i32.const 32
    i32.const 0
    local.get $p
    i32.const 0xffff8000
    i32.and
    select

    i32.const 15 ;; Control register R15
    call $SetRegister
    local.get $p
    local.get $Destination
    call $SetRegister ;; No need to convert to i16 because SetRegister does that
  )
  (func $I:add
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    (local $sum i32)
    (local $primary i32)
    (local $msba i32)
    (local $msbb i32)
    (local $msbsum i32)
    (local $carryOut i32)
    (local $tcOverflow i32)
    ;; 1, 3
    local.get $RegisterA
    call $GetRegister
    local.tee $a

    ;; 2, 3
    local.get $RegisterB
    call $GetRegister
    local.tee $b

    ;; 3, 4
    i32.add
    local.tee $sum

    ;; 4
    i32.const 0xffff
    i32.and
    local.set $primary

    ;; 5
    local.get $a
    i32.const 15
    i32.shr_u
    local.set $msba

    ;; 6
    local.get $b
    i32.const 15
    i32.shr_u
    local.set $msbb

    ;; 7
    local.get $primary
    i32.const 15
    i32.shr_u
    local.set $msbsum

    ;; 8
    local.get $sum
    i32.const 16
    i32.shr_u
    local.set $carryOut

    ;; 10
    local.get $msba
    i32.eqz
    local.get $msbb
    i32.eqz
    i32.and
    local.get $msbsum
    i32.and

    local.get $msba
    local.get $msbb
    i32.and
    local.get $msbsum
    i32.eqz
    i32.and

    i32.or
    local.set $tcOverflow

    ;; 15
    local.get $carryOut
    i32.const 192 ;; bit_ccV | bit_ccC
    i32.mul
    local.get $tcOverflow
    i32.const 5 ;; ccv
    i32.shl
    i32.or
    local.get $primary
    i32.eqz
    i32.const 2 ;; ccE
    i32.shl
    i32.or
    local.get $sum
    i32.const 0
    i32.ne
    i32.const 1 ;; ccG
    i32.shl
    i32.or
    local.get $msbsum
    local.get $tcOverflow
    i32.or
    i32.eqz
    ;; ccg == 0, so no shift is necessary
    i32.or
    local.get $tcOverflow
    i32.eqz
    local.get $msbsum
    i32.and
    i32.const 4 ;; ccl
    i32.shl
    i32.or

    ;; 16
    i32.const 15 ;; Select R15
    call $SetRegister

    ;; 17
    local.get $primary
    local.get $Destination
    call $SetRegister
  )
  (func $I:sub
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    (local $primary i32)
    (local $msba i32)
    (local $msbb i32)
    (local $msbsum i32)
    (local $tcOverflow i32)
    ;; 1, 3
    local.get $RegisterA
    call $GetRegister
    local.tee $a

    ;; 2, 3
    local.get $RegisterB
    call $GetRegister
    local.tee $b


    i32.sub

    ;; 5
    i32.const 0xffff
    i32.and
    local.set $primary

    ;; 6
    local.get $a
    i32.const 15
    i32.shr_u
    local.set $msba

    ;; 7
    local.get $b
    i32.const 15
    i32.shr_u
    local.set $msbb

    ;; 8
    local.get $primary
    i32.const 15
    i32.shr_u
    local.set $msbsum

    ;; 11
    local.get $msba
    i32.eqz
    local.get $msbb
    i32.eqz
    i32.and
    local.get $msbsum
    i32.and

    local.get $msba
    local.get $msbb
    i32.and
    local.get $msbsum
    i32.eqz
    i32.and

    i32.or
    local.set $tcOverflow

    ;; 16
    local.get $a
    local.get $b
    i32.ge_u
    i32.const 192 ;; bit_ccV | bit_ccC
    i32.mul
    local.get $tcOverflow
    i32.const 5 ;; ccv
    i32.shl
    i32.or
    local.get $primary
    i32.eqz
    i32.const 2 ;; ccE
    i32.shl
    i32.or
    i32.const 2 ;; ccG
    i32.or
    local.get $msbsum
    local.get $tcOverflow
    i32.or
    i32.eqz
    ;; ccg == 0, so no shift is necessary
    i32.or
    local.get $tcOverflow
    i32.eqz
    local.get $msbsum
    i32.and
    i32.const 4 ;; ccl
    i32.shl
    i32.or

    ;; 17
    i32.const 15 ;; Select R15
    call $SetRegister
    
    ;; 18
    local.get $primary
    local.get $Destination
    call $SetRegister
  )
  (func $I:div
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    ;; 1
    local.get $RegisterA
    call $GetRegister
    local.set $a

    ;; 2, 3
    local.get $RegisterB
    call $GetRegister
    local.tee $b

    if
      local.get $a
      local.get $b
      i32.rem_u
      i32.const 15
      call $SetRegister

      local.get $a
      i32.extend16_s
      f32.convert_i32_s
      local.get $b
      i32.extend16_s
      f32.convert_i32_s
      f32.div
      f32.floor
      i32.trunc_f32_s
      local.get $Destination
      call $SetRegister
    else
      i32.const 0
      i32.const 15
      call $SetRegister
      i32.const 0
      local.get $Destination
      call $SetRegister
    end
  )
  (func $I:addc
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    (local $sum i32)
    (local $primary i32)
    (local $msba i32)
    (local $msbb i32)
    (local $msbsum i32)
    (local $carryOut i32)
    (local $tcOverflow i32)
    ;; 1, 3
    local.get $RegisterA
    call $GetRegister
    local.tee $a

    ;; 2, 3
    local.get $RegisterB
    call $GetRegister
    local.tee $b

    ;; 3, 4
    i32.add

    i32.const 15
    call $GetRegister
    i32.const 7
    i32.shr_u
    i32.const 1
    i32.and
    
    i32.add

    local.tee $sum

    ;; 4
    i32.const 0xffff
    i32.and
    local.set $primary

    ;; 5
    local.get $a
    i32.const 15
    i32.shr_u
    local.set $msba

    ;; 6
    local.get $b
    i32.const 15
    i32.shr_u
    local.set $msbb

    ;; 7
    local.get $primary
    i32.const 15
    i32.shr_u
    local.set $msbsum

    ;; 8
    local.get $sum
    i32.const 16
    i32.shr_u
    local.set $carryOut

    ;; 10
    local.get $msba
    i32.eqz
    local.get $msbb
    i32.eqz
    i32.and
    local.get $msbsum
    i32.and

    local.get $msba
    local.get $msbb
    i32.and
    local.get $msbsum
    i32.eqz
    i32.and

    i32.or
    local.set $tcOverflow

    ;; 15
    local.get $carryOut
    i32.const 192 ;; bit_ccV | bit_ccC
    i32.mul
    local.get $tcOverflow
    i32.const 5 ;; ccv
    i32.shl
    i32.or
    local.get $primary
    i32.eqz
    i32.const 2 ;; ccE
    i32.shl
    i32.or
    local.get $sum
    i32.const 0
    i32.ne
    i32.const 1 ;; ccG
    i32.shl
    i32.or
    local.get $msbsum
    local.get $tcOverflow
    i32.or
    i32.eqz
    ;; ccg == 0, so no shift is necessary
    i32.or
    local.get $tcOverflow
    i32.eqz
    local.get $msbsum
    i32.and
    i32.const 4 ;; ccl
    i32.shl
    i32.or

    ;; 16
    i32.const 15 ;; Select R15
    call $SetRegister

    ;; 17
    local.get $primary
    local.get $Destination
    call $SetRegister
  )
  (func $I:muln
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
    i32.const 16
    i32.shr_u
    i32.const 15 ;; Control register R15
    call $SetRegister
    local.get $p
    local.get $Destination
    call $SetRegister ;; No need to convert to i16 because SetRegister does that
  )
  (func $I:divn
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $Dividend i32)
    (local $Quotient i32)
    (local $B i32)
    local.get $RegisterB
    call $GetRegister
    local.tee $B
    if ;; B != 0
      local.get $RegisterA
      call $GetRegister
      i32.const 15
      call $GetRegister
      i32.const 16
      i32.shl
      i32.or
      local.tee $Dividend
      local.get $B
      i32.div_u
      local.tee $Quotient
      i32.const 15
      call $SetRegister
      local.get $Quotient
      i32.const 16
      i32.shr_u
      local.get $Destination
      call $SetRegister
      local.get $Dividend
      local.get $B
      i32.rem_u
      local.get $RegisterA
      call $SetRegister
    else
      i32.const 0
      i32.const 15
      call $SetRegister
      i32.const 0
      local.get $Destination
      call $SetRegister
      i32.const 0
      local.get $RegisterA
      call $SetRegister
    end
  )
  (func $I:cmp
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    local.get $RegisterA
    call $GetRegister
    local.set $a
    local.get $RegisterB
    call $GetRegister
    local.set $b

    ;;ccl 16
    ;;ccL 8
    ;;ccE 4
    ;;ccG 2
    ;;ccg 1
    local.get $a
    local.get $b
    i32.eq
    i32.const 2
    i32.shl

    local.get $a
    local.get $b
    i32.lt_u
    i32.const 3
    i32.shl
    i32.or

    local.get $a
    local.get $b
    i32.gt_u
    i32.const 1
    i32.shl
    i32.or

    local.get $a
    i32.extend16_s
    local.tee $a
    local.get $b
    i32.extend16_s
    local.tee $b
    i32.lt_s
    i32.const 4
    i32.shl
    i32.or

    local.get $a
    local.get $b
    i32.gt_s
    i32.or

    i32.const 15
    call $SetRegister
  )
  (func $I:brf
    (param $Offset i32)
    global.get $InstructionAddress
    local.get $Offset
    i32.const 1
    i32.shl ;;The instruction address is in bytes, not in words
    i32.add
    i32.const 131070
    i32.and
    global.set $InstructionAddress
  )
  (func $I:brb
    (param $Offset i32)
    global.get $InstructionAddress
    local.get $Offset
    i32.const 1
    i32.shl ;;The instruction address is in bytes, not in words
    i32.sub
    i32.const 131070
    i32.and
    global.set $InstructionAddress
  )
  (func $I:brfc0
    (param $Register i32)
    (param $SecondWord i32)
    (local $Bit i32)
    (local $Offset i32)
    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $Bit
    local.get $SecondWord
    i32.const 4095
    i32.and
    local.set $Offset

    local.get $Register
    call $GetRegister
    local.get $Bit
    i32.shl
    i32.const 1
    i32.and
    i32.eqz
    if
      local.get $Offset
      call $I:brf
    end
  )
  (func $I:brfc1
    (param $Register i32)
    (param $SecondWord i32)
    (local $Bit i32)
    (local $Offset i32)
    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $Bit
    local.get $SecondWord
    i32.const 4095
    i32.and
    local.set $Offset

    local.get $Register
    call $GetRegister
    local.get $Bit
    i32.shl
    i32.const 1
    i32.and
    if
      local.get $Offset
      call $I:brf
    end
  )
  (func $I:brbc0
    (param $Register i32)
    (param $SecondWord i32)
    (local $Bit i32)
    (local $Offset i32)
    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $Bit
    local.get $SecondWord
    i32.const 4095
    i32.and
    local.set $Offset

    local.get $Register
    call $GetRegister
    local.get $Bit
    i32.shl
    i32.const 1
    i32.and
    i32.eqz
    if
      local.get $Offset
      call $I:brb
    end
  )
  (func $I:brbc1
    (param $Register i32)
    (param $SecondWord i32)
    (local $Bit i32)
    (local $Offset i32)
    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $Bit
    local.get $SecondWord
    i32.const 4095
    i32.and
    local.set $Offset

    local.get $Register
    call $GetRegister
    local.get $Bit
    i32.shl
    i32.const 1
    i32.and
    if
      local.get $Offset
      call $I:brb
    end
  )
  (func $I:brfz
    (param $Register i32)
    (param $Offset i32)
    local.get $Register
    i32.eqz
    if
      local.get $Offset
      call $I:brf
    end
  )
  (func $I:brbz
    (param $Register i32)
    (param $Offset i32)
    local.get $Register
    i32.eqz
    if
      local.get $Offset
      call $I:brb
    end
  )
  (func $I:brfnz
    (param $Register i32)
    (param $Offset i32)
    local.get $Register
    if
      local.get $Offset
      call $I:brf
    end
  )
  (func $I:brbnz
    (param $Register i32)
    (param $Offset i32)
    local.get $Register
    if
      local.get $Offset
      call $I:brb
    end
  )
  (func $I:dsptch
    (param $Register i32)
    (param $SecondWord i32)
    (local $Bit i32)
    (local $Offset i32)
    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $Bit
    local.get $SecondWord
    i32.const 4095
    i32.and
    local.set $Offset

    local.get $Register
    call $GetRegister
    i32.const 1
    local.get $Bit
    i32.shl
    i32.const 1
    i32.sub
    i32.and
    i32.const 1
    i32.shl
    local.get $Offset
    i32.add
    call $I:brf
  )
  (func $I:save
    (param $StartRegister i32)
    (param $SecondWord i32)
    (local $EndRegister i32)
    (local $Offset i32)
    (local $CurrentRegister i32)
    local.get $SecondWord
    i32.const 255
    i32.and
    ;; Immediate offset

    local.get $SecondWord
    i32.const 8
    i32.shr_u
    i32.const 15
    i32.and
    ;; Offset register
    call $GetRegister
    i32.add
    ;; Convert to byte offset
    i32.const 1
    i32.shl
    local.set $Offset

    local.get $SecondWord
    i32.const 12
    i32.shr_u
    ;;Don't need to AND because it's the last 4 bits
    local.set $EndRegister
    
    local.get $StartRegister
    local.set $CurrentRegister
    loop
      local.get $Offset
      local.get $CurrentRegister
      call $GetRegister
      i32.store16 offset=65536

      local.get $CurrentRegister
      local.get $EndRegister
      i32.ne


      local.get $CurrentRegister
      i32.const 1
      i32.add
      i32.const 15
      i32.and
      local.set $CurrentRegister

      local.get $Offset
      i32.const 2
      i32.add
      local.set $Offset

      
      br_if 0
    end
  )
  (func $I:restor
    (param $StartRegister i32)
    (param $SecondWord i32)
    (local $EndRegister i32)
    (local $Offset i32)
    (local $CurrentRegister i32)
    local.get $SecondWord
    i32.const 255
    i32.and
    ;; Immediate offset

    local.get $SecondWord
    i32.const 8
    i32.shr_u
    i32.const 15
    i32.and
    ;; Offset register
    call $GetRegister
    i32.add
    ;; Convert to byte offset
    i32.const 1
    i32.shl
    local.set $Offset

    local.get $SecondWord
    i32.const 12
    i32.shr_u
    ;;Don't need to AND because it's the last 4 bits
    local.set $EndRegister
    
    local.get $StartRegister
    local.set $CurrentRegister
    loop
      local.get $Offset
      i32.load16_u offset=65536
      local.get $CurrentRegister
      call $SetRegister

      local.get $CurrentRegister
      local.get $EndRegister
      i32.ne


      local.get $CurrentRegister
      i32.const 1
      i32.add
      i32.const 15
      i32.and
      local.set $CurrentRegister

      local.get $Offset
      i32.const 2
      i32.add
      local.set $Offset

      
      br_if 0
    end
  )
  (func $I:push
    (param $RegisterD i32)
    (param $SecondWord i32)
    (local $RegisterE i32)
    (local $RegisterF i32)
    (local $Top i32)
    (local $Limit i32)

    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $RegisterE

    local.get $SecondWord
    i32.const 8
    i32.shr_u
    i32.const 15
    i32.and
    local.set $RegisterF

    

    local.get $RegisterE
    call $GetRegister
    local.set $Top

    local.get $RegisterF
    call $GetRegister
    local.set $Limit

    local.get $Top
    local.get $Limit
    i32.lt_u
    if
      i32.const 1
      local.get $Top
      i32.add
      local.tee $Top
      local.get $RegisterE
      call $SetRegister
      
      local.get $Top
      i32.const 1
      i32.shl
      local.get $RegisterD
      call $GetRegister
      i32.store offset=65536
    else
      i32.const 256
      i32.const 15
      call $SetRegister
      unreachable ;;Also set the `req` status register's 2nd bit
    end
  )
  (func $I:pop
    (param $RegisterD i32)
    (param $SecondWord i32)
    (local $RegisterE i32)
    (local $RegisterF i32)

    local.get $SecondWord
    i32.const 12
    i32.shr_u
    local.set $RegisterE

    local.get $SecondWord
    i32.const 8
    i32.shr_u
    i32.const 15
    i32.and
    local.set $RegisterF

    unreachable
  )
)