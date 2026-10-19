const Category = require('../models/categoryModel');
const httpError = require('../utils/httpError');
const { maxLength } = require('../utils/validate');

function parseBody(body) {
  const name = String(body.name || '').trim();
  if (!name) throw httpError(400, 'Vui lòng nhập tên danh mục');
  maxLength(name, 100, 'Tên danh mục');
  const description = body.description ? String(body.description).trim() : null;
  return { name, description };
}

exports.list = async (req, res) => res.json(await Category.findAll());

exports.get = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw httpError(404, 'Không tìm thấy danh mục');
  res.json(category);
};

exports.create = async (req, res) => {
  res.status(201).json(await Category.create(parseBody(req.body)));
};

exports.update = async (req, res) => {
  const category = await Category.update(req.params.id, parseBody(req.body));
  if (!category) throw httpError(404, 'Không tìm thấy danh mục');
  res.json(category);
};

exports.remove = async (req, res) => {
  if (!(await Category.remove(req.params.id))) throw httpError(404, 'Không tìm thấy danh mục');
  res.status(204).end();
};
