const getPagination = (page, size) => {
    const limit = size ? +size : 15; // Laravel defaults to 15
    const offset = page ? (page - 1) * limit : 0;
    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: total, rows: items } = data;
    const currentPage = page ? +page : 1;
    const lastPage = Math.ceil(total / limit);
  
    return {
        total,
        items,
        last_page: lastPage,
        current_page: currentPage,
        per_page: limit,
        // Optional: Add Laravel-style from/to indicators
        from: (currentPage - 1) * limit + 1,
        to: Math.min(currentPage * limit, total)
    };
};

module.exports = {getPagination, getPagingData}