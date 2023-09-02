import { TypeMapper } from './type-mapper'
import {
  IdlInstruction,
  IdlInstructionArg, IdlType,
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

      this.typeMapper.assertBeetSupported(
        ty,
        `instruction ${this.ix.name} discriminant field`
      )
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

  mapStringToIdlType(rawTy: object): IdlType {
    let ty: IdlType
    if(JSON.stringify(rawTy) === '"u8"'){
      ty = "u8"
    } else if(JSON.stringify(rawTy) === '{"array":["u8",8]}'){
      ty = "FixedSizeArray"
    } else {
      throw new Error(`Unsupported type ${rawTy} when parsing discriminant for instruction ${this.ix.name}`);
    }
    return ty
  }
}
