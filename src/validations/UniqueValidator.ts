import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { Not } from 'typeorm';
import dataService from '../Service/DataService';

@ValidatorConstraint({ async: true })
export class UniqueValidator implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entity, column,idField,condition] = args.constraints;  // Lấy entity, column và idField từ constraints

    // Lấy queryBuilder từ service
    let queryBuilder = await dataService.getBuilderQuery(entity);

    // Nếu idField có giá trị, tức là đang cập nhật, cần loại trừ bản ghi hiện tại
    let whereClause = { [column]: value }; // Điều kiện tìm kiếm mặc định
    if (idField) {
      // Loại trừ bản ghi có cùng giá trị nhưng với id khác
      whereClause = { ...whereClause, [idField]: Not(args.object[idField]) };
    }
    if(condition){
      whereClause={...whereClause,[condition.column]:args.object[condition.field]}
    }
    // Thực hiện truy vấn để tìm kiếm các bản ghi có giá trị trùng
    const existingEntity = await queryBuilder
      .where(whereClause)
      .getOne();

    return !existingEntity;  // Nếu không tìm thấy bản ghi, tức là giá trị là duy nhất
  }

  defaultMessage(args: ValidationArguments): string {
    const [entity, column] = args.constraints;
    return `${args.property} must be unique. The ${column} already exists in ${entity.name}.`;  // Thông báo lỗi nếu vi phạm
  }
}



export function IsUnique(entity: Function, column: string, idField: string,condition?:unknown,validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isUnique',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [entity, column, idField,condition],  // Truyền thêm idField để phân biệt giữa update và create
        options: validationOptions,
        validator: UniqueValidator,
      });
    };
}

  