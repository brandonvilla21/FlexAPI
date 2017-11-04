use flex_admin_logs;

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `log_id` int(11) NOT NULL,
  `message` varchar(512) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `errno` int(11) DEFAULT NULL,
  `sqlMessage` varchar(512) DEFAULT NULL,
  `sqlStateMessage` varchar(50) DEFAULT NULL,
  `indexMessage` int(11) DEFAULT NULL,
  `sqlQuery` varchar(512) DEFAULT NULL,
  `JSON` varchar(1024) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`log_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;