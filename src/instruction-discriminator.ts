import { TypeMapper } from './type-mapper'
import {
  IdlInstruction,
  IdlInstructionArg, IdlType, IdlTypeArray,
  isShankIdlInstruction,
} from './types'
import {
  anchorDiscriminatorField,
  anchorDiscriminatorType,
  instructionDiscriminator,
} from './utils'

export class InstructionDiscriminator {
  constructor(
    private readonly ix: IdlInstruction,
    private readonly fieldName: string,
    private readonly typeMapper: TypeMapper
  ) {}

  renderValue() {
    return isShankIdlInstruction(this.ix)
      ? JSON.stringify(this.ix.discriminant.value)
      : JSON.stringify(Array.from(instructionDiscriminator(this.ix.name)))
  }

  getField(): IdlInstructionArg {
    if (isShankIdlInstruction(this.ix)) {
      const ty = this.mapStringToIdlType(this.ix.discriminant.type);
      if(!this.checkIfIdlArray(ty)){
        this.typeMapper.assertBeetSupported(
            ty,
            `instruction ${this.ix.name} discriminant field`
        )
      }
      return { name: this.fieldName, type: ty }
    }

    return anchorDiscriminatorField(this.fieldName)
  }

  renderType(): string {
    return isShankIdlInstruction(this.ix)
      ? this.typeMapper.map(
          this.mapStringToIdlType(this.ix.discriminant.type),
          `instruction ${this.ix.name} discriminant type`
        )
      : anchorDiscriminatorType(
          this.typeMapper,
          `instruction ${this.ix.name} discriminant type`
        )
  }

  checkIfIdlArray(ty: IdlType): ty is IdlTypeArray {
    return (ty as IdlTypeArray).array !== undefined
  }

  mapStringToIdlType(rawTy: object): IdlType {
    let ty: IdlType
    if(JSON.stringify(rawTy) === '"u8"'){
      ty = "u8"
    } else if(JSON.stringify(rawTy) === '{"array":["u8",8]}'){
      ty = { array: ['u8', 8] } as IdlTypeArray
    } else {
      throw new Error(`Unsupported type ${rawTy} when parsing discriminant for instruction ${this.ix.name}`);
    }
    return ty
  }
}
