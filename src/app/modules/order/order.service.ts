import { Order, Prisma } from '@prisma/client';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { prisma } from '../../../shared/prisma';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { IOrderData, IOrderFilterRequest } from './order.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { orderRelationalFields, orderRelationalFieldsMapper, orderSearchableFields } from './order.constants';

const insertIntoDB = async (token: string, data: IOrderData): Promise<Order> => {
  const user = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);
  if(!user){
    throw new ApiError(httpStatus.NOT_FOUND, "user not found");
  }
  if(!data.userId){
    data.userId = user.userId
  }
  const result = await prisma.order.create({
    data
  });
  
  return result;
};

const getOrders = async (
    filters: IOrderFilterRequest,
    options: IPaginationOptions
  ): Promise<IGenericResponse<Order[]>> => {
    const { size, page, skip } = paginationHelpers.calculatePagination(options);
    const { search,...filterData } = filters;
  
    const andConditions = [];
  
    if (search) {
      andConditions.push({
        OR: orderSearchableFields.map(field => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
      });
    }
  
    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map(key => {
          if (orderRelationalFields.includes(key)) {
            return {
              [orderRelationalFieldsMapper[key]]: {
                id: (filterData as any)[key],
              },
            };
          } else {
            return {
              [key]: {
                equals: (filterData as any)[key],
              },
            };
          }
        }),
      });
    }
  
    const whereConditions: Prisma.OrderWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};
  
    const result = await prisma.order.findMany({
      where: whereConditions,
      skip,
      take: size,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : {
              createdAt: 'desc',
            },
      include: {
        user: true,
      },
    });
    const total = await prisma.order.count({
      where: whereConditions,
    });
  
    const subtotal = await prisma.order.count();
  
    const totalPage = Math.ceil(subtotal / size);
  
    return {
      meta: {
        total,
        page,
        size,
        totalPage,
      },
      data: result,
    };
  };

export const OrderService = {
  insertIntoDB,
  getOrders
};