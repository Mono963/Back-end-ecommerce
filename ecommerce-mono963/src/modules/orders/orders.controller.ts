import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './Dto/order.Dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await this.ordersService.addOrder(createOrderDto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Error al crear la orden. Verifica los datos enviados.',
      );
    }
  }

  @Get(':id')
  async getOrderById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await this.ordersService.getOrder(id);
      if (!order) throw new NotFoundException('Orden no encontrada');
      return order;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('ID inválido o error al obtener la orden');
    }
  }
}
