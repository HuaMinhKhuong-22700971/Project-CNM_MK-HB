export function SearchBar() {
  return (
    <>
      <div className="market-search-wrap">
        <form className="market-search" onSubmit={(event) => event.preventDefault()}>
          <input placeholder="Tìm CPU, card đồ họa, RAM, SSD, màn hình gaming..." />
          <button type="submit">Tìm kiếm</button>
        </form>
      </div>
      <div className="market-search__suggestions">
        <span>RTX 4060</span>
        <span>Core i5 14400F</span>
        <span>Mainboard B760</span>
        <span>RAM DDR5 32GB</span>
        <span>SSD NVMe 1TB</span>
        <span>PC gaming 20 triệu</span>
      </div>
    </>
  );
}
