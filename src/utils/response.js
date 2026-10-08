export const success = (res, data = null, message = "Success", statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const created = (res, data = null, message = "Created") =>
  success(res, data, message, 201);

export const noContent = (res) => res.status(204).send();

export const paginated = (res, items, total, page, limit, message = "Success") =>
  res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });