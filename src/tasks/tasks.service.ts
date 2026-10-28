import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { parseDateOnly, toDateOnly } from '../common/date.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: User, date: string) {
    const tasks = await this.prisma.task.findMany({
      where: { userId: user.id, date: parseDateOnly(date) },
      orderBy: [{ done: 'asc' }, { createdAt: 'asc' }],
    });
    return tasks.map(toTaskResponse);
  }

  async create(user: User, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title.trim(),
        date: parseDateOnly(dto.date),
        userId: user.id,
      },
    });
    return toTaskResponse(task);
  }

  async update(user: User, id: string, dto: UpdateTaskDto) {
    await this.ensureOwned(user.id, id);
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.done !== undefined ? { done: dto.done } : {}),
      },
    });
    return toTaskResponse(task);
  }

  async remove(user: User, id: string) {
    await this.ensureOwned(user.id, id);
    await this.prisma.task.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureOwned(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}

function toTaskResponse(task: {
  id: string;
  title: string;
  date: Date;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    date: toDateOnly(task.date),
    done: task.done,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
