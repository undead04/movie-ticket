import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ async: true })
export class MaxValueValidator implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [minValue,maxValue] = args.constraints;  // Lấy entity, column và idField từ constraints
    if(value>maxValue||value<minValue) return false
    return true
    
  }

  defaultMessage(args: ValidationArguments): string {
    const [minValue,maxValue] = args.constraints;
    return `${args.property} giá trị năm trong khoảng từ ${minValue} đến ${maxValue}`;  // Thông báo lỗi nếu vi phạm
  }
}



export function MaxValue(minValue:number,maxValue:number,validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'maxValue',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [minValue,maxValue,],  // Truyền thêm idField để phân biệt giữa update và create
        options: validationOptions,
        validator: MaxValueValidator,
      });
    };
}

  