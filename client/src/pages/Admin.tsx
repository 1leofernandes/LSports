import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { appointmentService } from '../services/appointmentService';
import { Block } from '../types';

const Admin: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    const data = await appointmentService.getBlocks();
    setBlocks(data);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Administração
        </Typography>
        <Typography variant="h6" gutterBottom>
          Bloqueios
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Quadra</TableCell>
                <TableCell>Hora Início</TableCell>
                <TableCell>Hora Fim</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>{new Date(block.date).toLocaleDateString()}</TableCell>
                  <TableCell>{block.court}</TableCell>
                  <TableCell>{block.startTime}</TableCell>
                  <TableCell>{block.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Admin;