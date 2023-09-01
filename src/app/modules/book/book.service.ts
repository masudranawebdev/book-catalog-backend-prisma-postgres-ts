import { Book } from '@prisma/client';
import { prisma } from '../../../shared/prisma';

const insertIntoDB = async (data: Book): Promise<Book> => {
  const result = await prisma.book.create({ data });
  return result;
};

export const BookService = {
  insertIntoDB,
};
