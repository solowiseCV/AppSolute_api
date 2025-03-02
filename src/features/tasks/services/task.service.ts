import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (question: string, options: string[], correctAnswer: string) => {
  return await prisma.task.create({
    data: {
      question,
      options,
      correctAnswer,
    },
  });
};

export const getAllTasks = async () => {
  return await prisma.task.findMany();
};

export const deleteTask = async (taskId: string) => {
  return await prisma.task.delete({ where: { id: taskId } });
};

export const updateTask = async(taskId: string, question: string, options: string[], correctAnswer: string) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      question,
      options,
      correctAnswer,
    },
  });
}
