import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import dataSource from '../DataSource';
import { EntityTarget } from 'typeorm';

@ValidatorConstraint({ async: true })
export class ExistsValidator implements ValidatorConstraintInterface {

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entity, idFiled] = args.constraints;
    console.log(entity)
     // Nếu value là mảng, kiểm tra từng phần tử
     if (Array.isArray(value)) {
      const repository = dataSource.getRepository(entity);
      for (const item of value) {
        const existingEntity = await repository.findOne({ where: { [idFiled]: item } });
        if (!existingEntity) {
          return false; // Nếu bất kỳ phần tử nào không tồn tại, trả về false
        }
      }
      return true; // Tất cả phần tử đều tồn tại
    }
    // Kiểm tra sự tồn tại của bản ghi theo id
    const existingEntity = await dataSource.getRepository(entity).findOne({where:{[idFiled]:value}});
    return !!existingEntity;  // Trả về true nếu bản ghi tồn tại
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} does not exist`;  // Thông báo lỗi nếu không tìm thấy bản ghi
  }
}

// Tạo decorator để sử dụng custom validation
export function Exists<T>(entityClass: EntityTarget<T>,idFiled:string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'exists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [entityClass,idFiled],
      options: validationOptions,
      validator: ExistsValidator,
    });
  };
}
