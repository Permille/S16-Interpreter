(module
  (import "Main" "Memory" (memory 3 65536))
  (import "Instructions" "I:Trap:Read" (func $I:Trap:Read (param i32 i32)))
  (import "Instructions" "I:Trap:Write" (func $I:Trap:Write (param i32 i32)))
  (global $InstructionAddress (export "InstructionAddress") (mut i32) (i32.const 0))
  (global $ErrorState (export "ErrorState") (mut i32) (i32.const 0))
  (global $InstructionsExecuted (export "InstructionsExecuted") (mut i64) (i64.const 0))

  (func $GetInstructionAddress (export "GetInstructionAddress") (result i32) global.get $InstructionAddress i32.const 1 i32.shr_u)
  (func $SetInstructionAddress (export "SetInstructionAddress") (param i32) local.get 0 i32.const 1 i32.shl global.set $InstructionAddress)
  

  (func $GetRegister (export "GetRegister") (param $RegisterID i32) (result i32)
    ;;local.get $RegisterID
    ;;i32.eqz
    ;;if i32.const 0 return end
    i32.const 0
    i32.const 0
    i32.store16 offset=1024
    
    local.get $RegisterID
    i32.const 2
    i32.shl
    i32.load16_u offset=1024
  )
  (func $SetRegister (export "SetRegister") (param $Value i32) (param $RegisterID i32)
    local.get $RegisterID
    i32.eqz
    if return end
    local.get $RegisterID
    i32.const 2
    i32.shl
    local.get $Value
    i32.store16 offset=1024
  )
  (func $GetRegister:32 (export "GetRegister_32") (param $RegisterID i32) (result i32)
    i32.const 0
    i32.const 0
    i32.store offset=1024
    
    local.get $RegisterID
    i32.const 2
    i32.shl
    i32.load offset=1024
  )
  (func $SetRegister:32 (export "SetRegister_32") (param $Value i32) (param $RegisterID i32)
    local.get $RegisterID
    i32.eqz
    if return end
    local.get $RegisterID
    i32.const 2
    i32.shl
    local.get $Value
    i32.store offset=1024
  )
  (func (export "Reset")
    (local $i i32)
    i32.const 0
    global.set $InstructionAddress
    i32.const 0
    global.set $ErrorState
    i64.const 0
    global.set $InstructionsExecuted

    loop
      i32.const 0
      local.get $i
      call $SetRegister:32

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
    memory.size
    i32.const 1
    i32.sub
    i32.const 16
    i32.shl
    memory.fill
  )
  (func (export "Run") (param $MaxIterations i32) (result i32)
    (local $b i32)
    (local $a i32)
    (local $d i32)
    (local $Code i32)
    (local $FirstByte i32)
    (local $IsNot32Bit i32)
    (local $SecondByte i32)
    (local $SecondWord i32)
    loop $MainLoop
      global.get $InstructionsExecuted
      i64.const 1
      i64.add
      global.set $InstructionsExecuted

      local.get $IsNot32Bit
      i32.const 1
      i32.sub
      local.set $IsNot32Bit

      local.get $IsNot32Bit
      i32.const 0xfffffffe
      i32.eq
      if ;;Prevent accidental overflow after 4294967295 iterations
        i32.const 0xffffffff
        local.set $IsNot32Bit
      end

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
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:add
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:add:32
        end
        br $Exit
      end
        ;; sub
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:sub
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:sub:32
        end
        br $Exit
      end
        ;; mul
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:mul
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:mul:32
        end
        br $Exit
      end
        ;; div
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:div
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:div:32
        end
        br $Exit
      end
        ;; cmp
        local.get $IsNot32Bit
        if
          local.get $a
          local.get $b
          call $I:cmp
        else
          local.get $a
          local.get $b
          call $I:cmp:32
        end
        br $Exit
      end
        ;; addc
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:addc
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:addc:32
        end
        br $Exit
      end
        ;; muln
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:muln
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:muln:32
        end
        br $Exit
      end
        ;; divn
        local.get $IsNot32Bit
        if
          local.get $d
          local.get $a
          local.get $b
          call $I:divn
        else
          local.get $d
          local.get $a
          local.get $b
          call $I:divn:32
        end
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
          local.get $a
          call $GetRegister
          local.get $b
          call $GetRegister
          call $I:Trap:Read
          br $Exit
        end
          ;; 2: Write
          local.get $a
          call $GetRegister
          local.get $b
          call $GetRegister
          call $I:Trap:Write
          br $Exit
        end
          ;; 3: Blocking read, not implemented by Sigma16, nop
          nop
          br $Exit
        end
          ;; 4: Breakpoint
          i32.const 2
          return
        end
          ;; Do nothing
          nop
          br $Exit
        end
      end
        ;;nop ;; no-op (0xd)
        ;;Set 32-bit flag
        ;;This will be subtraced at the start of the next cycle, and will become 0
        i32.const 1
        local.set $IsNot32Bit
        global.get $InstructionsExecuted
        i64.const 1
        i64.sub
        global.set $InstructionsExecuted
        br $MainLoop
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
        block
          local.get $FirstByte
          br_table 0 1 2 3 4 5 6 7 8 9 10 11 12 13
        end
          ;;0x00 brf
          local.get $SecondWord
          call $I:brf
          br $Exit
        end
          ;;0x01 brb
          local.get $SecondWord
          call $I:brb
          br $Exit
        end
          ;;0x02 brfc0
          local.get $d
          local.get $SecondWord
          call $I:brfc0
          br $Exit
        end
          ;;0x03 brbc0
          local.get $d
          local.get $SecondWord
          call $I:brbc0
          br $Exit
        end
          ;;0x04 brfc1
          local.get $d
          local.get $SecondWord
          call $I:brfc1
          br $Exit
        end
          ;;0x05 brbc1
          local.get $d
          local.get $SecondWord
          call $I:brbc1
          br $Exit
        end
          ;;0x06 brfz
          local.get $d
          local.get $SecondWord
          call $I:brfz
          br $Exit
        end
          ;;0x07 brbz
          local.get $d
          local.get $SecondWord
          call $I:brbz
          br $Exit
        end
          ;;0x08 brfnz
          local.get $d
          local.get $SecondWord
          call $I:brfnz
          br $Exit
        end
          ;;0x09 brbnz
          local.get $d
          local.get $SecondWord
          call $I:brbnz
          br $Exit
        end
          ;;0x0a dsptch
          local.get $d
          local.get $SecondWord
          call $I:dsptch
          br $Exit
        end
          ;;0x0b save
          local.get $d
          local.get $SecondWord
          call $I:save
          br $Exit
        end
          ;;0x0c restor
          local.get $d
          local.get $SecondWord
          call $I:restor
          br $Exit
        end
          ;;>=0x0d
          local.get $FirstByte
          i32.const 255
          i32.eq
          if
            local.get $d
            call $I:memsize
          end

          br $Exit
        end
        br $Exit
      end
        ;; RX (0xf)
        local.get $IsNot32Bit
        if
          global.get $InstructionAddress
          i32.load16_u offset=65536 ;; This does not handle the case when InstructionAddress is out of bounds
          local.set $SecondWord

          global.get $InstructionAddress
          i32.const 2 ;;This is in bytes, so it increments by 1 word
          i32.add
          global.set $InstructionAddress
        else
          global.get $InstructionAddress
          i32.load offset=65536 ;; This does not handle the case when InstructionAddress is out of bounds
          local.set $SecondWord

          global.get $InstructionAddress
          i32.const 4 ;;This is in bytes, so it increments by 2 words
          i32.add
          global.set $InstructionAddress
        end
        block block block block block block block block block block block block block block block block block
          local.get $b
          br_table 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
        end
          ;; lea (0xf__0)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:lea
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:lea:32
          end
          br $Exit
        end
          ;; load (0xf__1)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:load
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:load:32
          end
          br $Exit
        end
          ;; store (0xf__2)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:store
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:store:32
          end
          br $Exit
        end
          ;; jump (0xf__3)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jump
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jump:32
          end
          br $Exit
        end
          ;; jumpc0 (0xf__4)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jumpc0
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jumpc0:32
          end
          br $Exit
        end
          ;; jumpc1 (0xf__5)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jumpc1
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jumpc1:32
          end
          br $Exit
        end
          ;; jal (0xf__6)
          local.get $IsNot32Bit
          if
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jal
          else
            local.get $d
            local.get $a
            local.get $SecondWord
            call $I:jal:32
          end
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
    call $SetRegister:32
  )
  (func $I:lea:32
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister:32
    local.get $ImmediateOffset
    i32.add
    local.get $Destination
    call $SetRegister:32
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
    call $SetRegister:32
  )
  (func $I:load:32
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister:32
    local.get $ImmediateOffset
    i32.add
    i32.const 1
    i32.shl
    i32.load offset=65536
    local.get $Destination
    call $SetRegister:32
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
    call $GetRegister:32
    i32.store16 offset=65536
  )
  (func $I:store:32
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister:32
    local.get $ImmediateOffset
    i32.add
    i32.const 1
    i32.shl
    local.get $Destination
    call $GetRegister:32
    i32.store offset=65536
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
  (func $I:jump:32
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister:32
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
  (func $I:jumpc0:32
    (param $Bit i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    i32.const 15
    call $GetRegister:32
    local.get $Bit
    i32.shr_u
    i32.const 1
    i32.and
    if return end
    local.get $Parameter
    call $GetRegister:32
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
  (func $I:jumpc1:32
    (param $Bit i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    i32.const 15
    call $GetRegister:32
    local.get $Bit
    i32.shr_u
    i32.const 1
    i32.and
    if
      local.get $Parameter
      call $GetRegister:32
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
    i32.const 1
    i32.shr_u
    local.get $Destination
    call $SetRegister
    local.get $ImmediateOffset
    i32.add
    i32.const 1
    i32.shl
    global.set $InstructionAddress
  )
  (func $I:jal:32
    (param $Destination i32)
    (param $Parameter i32)
    (param $ImmediateOffset i32)
    local.get $Parameter
    call $GetRegister:32
    global.get $InstructionAddress
    i32.const 1
    i32.shr_u
    local.get $Destination
    call $SetRegister:32
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

    i32.const 65535
    i32.and
    i32.const 15 ;; Control register R15
    call $SetRegister:32
    local.get $p
    i32.const 65535
    i32.and
    local.get $Destination
    call $SetRegister:32 ;; No need to convert to i16 because SetRegister does that
  )
  (func $I:mul:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $FullProduct i64)
    local.get $RegisterA
    call $GetRegister:32
    i64.extend_i32_s
    local.get $RegisterB
    call $GetRegister:32
    i64.extend_i32_s
    i64.mul
    local.set $FullProduct
    
    i64.const 0xffffffff80000000
    local.get $FullProduct
    i64.and
    i64.const 0
    i64.ne
    i32.const 5
    i32.shl ;;Signed overflow

    i32.const 15 ;; Control register R15
    call $SetRegister:32
    local.get $FullProduct
    i32.wrap_i64
    local.get $Destination
    call $SetRegister:32
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
    i32.const 65535
    i32.and
    i32.const 15 ;; Select R15
    call $SetRegister:32

    ;; 17
    local.get $primary
    i32.const 65535
    i32.and
    local.get $Destination
    call $SetRegister:32
  )
  (func $I:add:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    (local $Sum i32)
    local.get $RegisterA
    call $GetRegister:32
    local.set $a

    local.get $RegisterB
    call $GetRegister:32
    local.set $b

    local.get $a
    local.get $b
    i32.add
    local.set $Sum

    local.get $Sum
    local.get $a
    i32.lt_s
    local.get $b
    i32.const 0
    i32.lt_s
    i32.and
    i32.const 5
    i32.shl ;; Signed integer overflow

    local.get $a
    local.get $Sum
    i32.lt_u
    i32.const 6
    i32.shl ;; Unsigned integer overflow
    i32.or

    i32.const 15
    call $SetRegister:32

    local.get $Sum
    local.get $Destination
    call $SetRegister:32
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
    i32.const 65535
    i32.and
    i32.const 15 ;; Select R15
    call $SetRegister:32
    
    ;; 18
    local.get $primary
    i32.const 65535
    i32.and
    local.get $Destination
    call $SetRegister:32
  )
  (func $I:sub:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    (local $Sum i32)
    local.get $RegisterA
    call $GetRegister:32
    local.set $a

    local.get $RegisterB
    call $GetRegister:32
    local.set $b

    local.get $a
    local.get $b
    i32.sub
    local.set $Sum

    local.get $Sum
    local.get $a
    i32.lt_s
    local.get $b
    i32.const 0
    i32.gt_s ;;Greater than because subtracting
    i32.and
    i32.const 5
    i32.shl ;; Signed integer overflow

    local.get $a
    local.get $Sum
    i32.lt_u
    i32.const 6
    i32.shl ;; Unsigned integer overflow
    i32.or

    i32.const 15
    call $SetRegister:32

    local.get $Sum
    local.get $Destination
    call $SetRegister:32
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
      i32.const 65535
      i32.and
      i32.const 15
      call $SetRegister:32

      local.get $a
      i32.extend16_s
      f32.convert_i32_s
      local.get $b
      i32.extend16_s
      f32.convert_i32_s
      f32.div
      f32.floor
      i32.trunc_f32_s
      i32.const 65535
      i32.and
      local.get $Destination
      call $SetRegister:32
    else
      i32.const 0
      i32.const 15
      call $SetRegister:32
      i32.const 0
      local.get $Destination
      call $SetRegister:32
    end
  )
  (func $I:div:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    ;; 1
    local.get $RegisterA
    call $GetRegister:32
    local.set $a

    ;; 2, 3
    local.get $RegisterB
    call $GetRegister:32
    local.set $b

    local.get $a
    local.get $b
    i32.rem_s
    i32.const 15
    call $SetRegister:32

    local.get $a
    local.get $b
    i32.div_s
    local.get $Destination
    call $SetRegister:32
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
    i32.const 65535
    i32.and
    i32.const 15 ;; Select R15
    call $SetRegister:32

    ;; 17
    local.get $primary
    i32.const 65535
    i32.and
    local.get $Destination
    call $SetRegister:32
  )
  (func $I:addc:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    (local $Sum i32)
    local.get $RegisterA
    call $GetRegister:32
    local.set $a

    local.get $RegisterB
    call $GetRegister:32
    local.set $b

    i32.const 15
    call $GetRegister:32
    i32.const 7
    i32.shr_u
    i32.const 1
    i32.and
    local.get $a
    local.get $b
    i32.add
    i32.add
    local.set $Sum

    local.get $Sum
    local.get $a
    i32.lt_s
    local.get $b
    i32.const 0
    i32.lt_s
    i32.and
    i32.const 5
    i32.shl ;; Signed integer overflow

    local.get $a
    local.get $Sum
    i32.lt_u
    i32.const 6
    i32.shl ;; Unsigned integer overflow
    i32.or

    i32.const 15
    call $SetRegister:32

    local.get $Sum
    local.get $Destination
    call $SetRegister:32
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
    i32.const 65535
    i32.and
    i32.const 15 ;; Control register R15
    call $SetRegister:32
    local.get $p
    i32.const 65535
    i32.and
    local.get $Destination
    call $SetRegister:32 ;; No need to convert to i16 because SetRegister does that
  )
  (func $I:muln:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $FullProduct i64)
    local.get $RegisterA
    call $GetRegister:32
    i64.extend_i32_s
    local.get $RegisterB
    call $GetRegister:32
    i64.extend_i32_s
    i64.mul
    local.set $FullProduct
    
    local.get $FullProduct
    i64.const 32
    i64.shr_u
    i32.wrap_i64

    i32.const 15 ;; Control register R15
    call $SetRegister:32
    local.get $FullProduct
    i32.wrap_i64
    local.get $Destination
    call $SetRegister:32
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
      i32.const 65535
      i32.and
      i32.const 15
      call $SetRegister:32
      local.get $Quotient
      i32.const 16
      i32.shr_u
      i32.const 65535
      i32.and
      local.get $Destination
      call $SetRegister:32
      local.get $Dividend
      local.get $B
      i32.rem_u
      i32.const 65535
      i32.and
      local.get $RegisterA
      call $SetRegister:32
    else
      i32.const 0
      i32.const 15
      call $SetRegister:32
      i32.const 0
      local.get $Destination
      call $SetRegister:32
      i32.const 0
      local.get $RegisterA
      call $SetRegister:32
    end
  )
  (func $I:divn:32
    (param $Destination i32)
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $Dividend i64)
    (local $Quotient i64)
    (local $B i32)
    local.get $RegisterB
    call $GetRegister:32
    local.tee $B
    if ;; B != 0
      local.get $RegisterA
      call $GetRegister:32
      i64.extend_i32_u
      i32.const 15
      call $GetRegister:32
      i64.extend_i32_u
      i64.const 32
      i64.shl
      i64.or
      local.tee $Dividend
      local.get $B
      i64.extend_i32_u
      i64.div_u
      local.tee $Quotient
      i32.wrap_i64
      i32.const 15
      call $SetRegister:32
      local.get $Quotient
      i64.const 32
      i64.shr_u
      i32.wrap_i64
      local.get $Destination
      call $SetRegister:32
      local.get $Dividend
      local.get $B
      i64.extend_i32_u
      i64.rem_u
      i32.wrap_i64
      local.get $RegisterA
      call $SetRegister:32
    else
      i32.const 0
      i32.const 15
      call $SetRegister:32
      i32.const 0
      local.get $Destination
      call $SetRegister:32
      i32.const 0
      local.get $RegisterA
      call $SetRegister:32
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
    call $SetRegister:32
  )
  (func $I:cmp:32
    (param $RegisterA i32)
    (param $RegisterB i32)
    (local $a i32)
    (local $b i32)
    local.get $RegisterA
    call $GetRegister:32
    local.set $a
    local.get $RegisterB
    call $GetRegister:32
    local.set $b

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
    local.get $b
    i32.lt_s
    i32.const 4
    i32.shl
    i32.or

    local.get $a
    local.get $b
    i32.gt_s
    i32.or

    i32.const 15
    call $SetRegister:32
  )
  (func $I:brf
    (param $Offset i32)
    global.get $InstructionAddress
    local.get $Offset
    i32.const 1
    i32.shl ;;The instruction address is in bytes, not in words
    i32.add
    i32.const 4
    i32.sub
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
    i32.const 4
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
      call $SetRegister:32

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
  (func $I:memsize
    (param $Destination i32)
    memory.size
    i32.const 1
    i32.sub
    local.get $Destination
    call $SetRegister:32
  )
)