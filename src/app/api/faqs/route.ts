import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM faqs ORDER BY orden ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Error al obtener las preguntas frecuentes' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { pregunta, respuesta, imagen_fondo, orden } = await request.json();

    if (!pregunta || !respuesta || !imagen_fondo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Si no se proporciona orden, obtener el siguiente número
    let ordenFinal = orden;
    if (!ordenFinal) {
      const maxOrdenResult = await client.query('SELECT MAX(orden) as max_orden FROM faqs');
      ordenFinal = (maxOrdenResult.rows[0]?.max_orden || 0) + 1;
    }

    // Reorganizar órdenes si el orden ya existe
    await client.query(
      'UPDATE faqs SET orden = orden + 1 WHERE orden >= $1',
      [ordenFinal]
    );

    const result = await client.query(
      'INSERT INTO faqs (pregunta, respuesta, imagen_fondo, orden) VALUES ($1, $2, $3, $4) RETURNING *',
      [pregunta, respuesta, imagen_fondo, ordenFinal]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Error al crear la pregunta frecuente' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { id, pregunta, respuesta, imagen_fondo, orden } = await request.json();

    if (!id || !pregunta || !respuesta || !imagen_fondo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Obtener el orden actual del FAQ que se está editando
    const currentResult = await client.query('SELECT orden FROM faqs WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pregunta frecuente no encontrada' }, { status: 404 });
    }

    const ordenActual = currentResult.rows[0].orden;
    const nuevoOrden = orden;

    // Solo reorganizar si el orden cambió
    if (ordenActual !== nuevoOrden) {
      if (nuevoOrden > ordenActual) {
        // Si el nuevo orden es mayor, mover hacia abajo los que están entre el actual y el nuevo
        await client.query(
          'UPDATE faqs SET orden = orden - 1 WHERE orden > $1 AND orden <= $2 AND id != $3',
          [ordenActual, nuevoOrden, id]
        );
      } else {
        // Si el nuevo orden es menor, mover hacia arriba los que están entre el nuevo y el actual
        await client.query(
          'UPDATE faqs SET orden = orden + 1 WHERE orden >= $1 AND orden < $2 AND id != $3',
          [nuevoOrden, ordenActual, id]
        );
      }
    }

    const result = await client.query(
      'UPDATE faqs SET pregunta = $1, respuesta = $2, imagen_fondo = $3, orden = $4 WHERE id = $5 RETURNING *',
      [pregunta, respuesta, imagen_fondo, orden, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Error al actualizar la pregunta frecuente' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Obtener el orden del FAQ que se va a eliminar
    const orderResult = await client.query('SELECT orden FROM faqs WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pregunta frecuente no encontrada' }, { status: 404 });
    }

    const ordenEliminado = orderResult.rows[0].orden;

    // Eliminar el FAQ
    await client.query('DELETE FROM faqs WHERE id = $1', [id]);

    // Reorganizar los órdenes de los FAQs que tenían un orden mayor al eliminado
    await client.query(
      'UPDATE faqs SET orden = orden - 1 WHERE orden > $1',
      [ordenEliminado]
    );

    return NextResponse.json({ message: 'Pregunta frecuente eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Error al eliminar la pregunta frecuente' }, { status: 500 });
  } finally {
    client.release();
  }
}
