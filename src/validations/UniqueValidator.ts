import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import dataSource from '../DataSource';
import { Not } from 'typeorm';

@ValidatorConstraint({ async: true })
export class UniqueValidator implements ValidatorConstraintInterface {

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entity, column, idField] = args.constraints;  // Lấy idField để phân biệt update

    // Nếu idField có giá trị, tức là đang cập nhật
    const whereClause = idField ? { [column]: value, [idField]: Not(args.object[idField]) } : { [column]: value };

    // Kiểm tra tính duy nhất (trong trường hợp này, tìm thể loại với tên giống nhau, trừ bản ghi hiện tại)
    const existingEntity = await dataSource.getRepository(entity).findOne({ where: whereClause });

    return !existingEntity;  // Trả về true nếu không tìm thấy bản ghi, tức là "unique"
  }

  defaultMessage(args: ValidationArguments): string {
    const [entity, column] = args.constraints;
    return `${args.property} must be unique. The ${column} already exists in ${entity.name}.`;  // Thông báo lỗi tùy chỉnh
  }
}





export function IsUnique(entity: Function, column: string, idField: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isUnique',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [entity, column, idField],  // Truyền thêm idField để phân biệt giữa update và create
        options: validationOptions,
        validator: UniqueValidator,
      });
    };
}

  