import { Controller, Post, Body, Param, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TransactionAccessService } from '../services/transaction-access.service';
import { JoinTransactionWithCodeDto } from '../dto/join-transaction-with-code.dto';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@ApiTags('transactions-access')
@Controller('transactions')
@ApiBearerAuth()
export class TransactionAccessController {
  constructor(
    private readonly transactionAccessService: TransactionAccessService,
  ) {}

  @Post('join-with-code')
  @ApiOperation({ summary: 'Join a transaction using an access code' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the transaction',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid code or user already assigned',
  })
  @ApiResponse({ status: 403, description: 'User role not allowed to join' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async joinWithCode(
    @Request() req: AuthenticatedRequest,
    @Body() dto: JoinTransactionWithCodeDto,
  ) {
    return this.transactionAccessService.joinTransactionWithCode(
      req.user.sub,
      dto.accessCode,
    );
  }

  @Post(':transactionId/regenerate-access-code')
  @ApiOperation({ summary: 'Regenerate transaction access code' })
  @ApiParam({ name: 'transactionId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Access code regenerated' })
  async regenerateAccessCode(@Param('transactionId') transactionId: string) {
    return this.transactionAccessService.regenerateAccessCode(transactionId);
  }
}
